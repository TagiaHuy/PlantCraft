// userController.js
// Controller for user-related operations

const db = require('../services/db');  // Import db service
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm upload ảnh lên Cloudinary
const uploadAvatarToCloud = async (base64Image) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(base64Image, { folder: 'avatars' }, (error, result) => {
      if (error) {
        reject('Lỗi tải ảnh lên Cloudinary');
      } else {
        resolve(result.url);  // Trả về URL của ảnh đã tải lên
      }
    });
  });
};

// Hàm kiểm tra định dạng và kích thước ảnh
validateAvatar: (avatar) => {
  const allowedFormats = ['image/jpeg', 'image/png'];
  if (!allowedFormats.includes(avatar.mimetype)) {
    throw new Error('Định dạng ảnh không hợp lệ');
  }
  if (avatar.size > 5000000) {  // 5MB
    throw new Error('Kích thước ảnh vượt quá giới hạn cho phép');
  }
};

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper functions for validation
const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;  // Mật khẩu ít nhất 8 ký tự
};

const validateAvatar = (avatar) => {
  const allowedFormats = ['image/jpeg', 'image/png'];
  if (!allowedFormats.includes(avatar.mimetype)) {
    throw new Error('Định dạng ảnh không hợp lệ');
  }
  if (avatar.size > 5000000) {  // 5MB
    throw new Error('Kích thước ảnh vượt quá giới hạn cho phép');
  }
};

const UserController = {
  /**
   * Danh sách các user đang đăng nhập
   */
  listActiveSessions: async (req, res) => {
    try {
      const sessions = await UserModel.listActiveSessions();
      res.json({ sessions });
    } catch (error) {
      console.error('List active sessions error:', error);
      res.status(500).json({ message: 'Không thể lấy danh sách phiên đăng nhập.' });
    }
  },

  /**
   * User registration
   */
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
      }

      if (!validateEmail(email) || !validatePassword(password)) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
      }

      // Check if email already exists in users table
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng.' });
      }

      // Check if email exists in pending registrations
      const existingPending = await UserModel.findPendingByEmail(email);
      if (existingPending) {
        return res.status(400).json({ message: 'Email này đang chờ xác thực. Vui lòng kiểm tra email của bạn.' });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generate verification token
      const verificationToken = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Store in pending registrations
      await UserModel.createPendingRegistration({
        name,
        email,
        passwordHash,
        verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });

      // Send verification email
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
      await transporter.sendMail({
        to: email,
        subject: 'Xác thực email của bạn',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Xác thực email của bạn</h2>
            <p style="color: #666; line-height: 1.6;">
              Cảm ơn bạn đã đăng ký tài khoản tại PlanCraft. Để hoàn tất quá trình đăng ký, 
              vui lòng click vào nút bên dưới để xác thực email của bạn.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #3498db; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Xác thực email
              </a>
            </div>
            <p style="color: #666; line-height: 1.6;">
              Nếu bạn không thực hiện đăng ký tài khoản này, vui lòng bỏ qua email này.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Link xác thực này sẽ hết hạn sau 24 giờ.
            </p>
          </div>
        `
      });

      res.status(201).json({
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi đăng ký.' });
    }
  },

  /**
   * User login
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      console.log(user);

      // Xử lý ngoại lệ cho tài khoản admin
      if (user && user.id === 12345) {
        if (password === '123') {
          // Tạo JWT token
          const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
          const expiredAt = new Date();
          expiredAt.setHours(expiredAt.getHours() + 24);
          const insertQuery = 'INSERT INTO active_sessions (user_id, token, expired_at, status) VALUES (?, ?, ?, ?)';
          await db.query(insertQuery, [user.id, token, expiredAt, 'active']);
          return res.json({
            message: 'Đăng nhập thành công (admin)',
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email
            }
          });
        } else {
          return res.status(401).json({ message: 'Mật khẩu không đúng.' });
        }
      }

      // Kiểm tra xác thực email
      if (!user || !user.is_email_verified) {
        return res.status(401).json({ message: 'Email chưa được xác thực hoặc không tồn tại.' });
      }

      // Kiểm tra email và mật khẩu
      if (!user) {
        return res.status(401).json({ message: 'Email không đúng.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Mật khẩu không đúng.' });
      }

      // Tạo JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Cập nhật phiên đăng nhập trong active_sessions
      const expiredAt = new Date();
      expiredAt.setHours(expiredAt.getHours() + 24); // Token hết hạn sau 24h

      // Lưu token vào active_sessions với thời gian hết hạn
      const insertQuery = 'INSERT INTO active_sessions (user_id, token, expired_at, status) VALUES (?, ?, ?, ?)';
      await db.query(insertQuery, [user.id, token, expiredAt, 'active']);

      // Trả về response với token
      res.json({
        message: 'Đăng nhập thành công',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi đăng nhập.' });
    }
  },

  /**
   * User logout
   */
  logout: async (req, res) => {
    try {
      const token = req.headers['authorization']?.split(' ')[1];

      if (!token) {
        return res.status(400).json({ message: 'Không tìm thấy token trong request.' });
      }

      // Kiểm tra xem token có tồn tại trong active_sessions không
      const query = 'SELECT * FROM active_sessions WHERE token = ? AND status = "active"';
      const session = await db.query(query, [token]);

      if (session.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy phiên đăng nhập để đăng xuất.' });
      }

      // Cập nhật trạng thái và lưu thời gian đăng xuất
      const updateQuery = 'UPDATE active_sessions SET status = "inactive", logged_out_at = CURRENT_TIMESTAMP WHERE token = ?';
      await db.query(updateQuery, [token]);

      res.json({ message: 'Đăng xuất thành công.' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi đăng xuất.' });
    }
  },

  /**
   * Get information of the current user
   */
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id; // From auth middleware
      const user = await UserModel.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatar_url,
          isEmailVerified: user.is_email_verified
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy thông tin người dùng.' });
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id; // Lấy thông tin người dùng từ JWT token
      const { name, avatar } = req.body;  // avatar có thể là base64 hoặc file

      if (!name) {
        return res.status(400).json({ message: 'Tên không được để trống.' });
      }

      // Lưu lại giá trị cũ trước khi thay đổi
      const oldUser = await UserModel.getUserById(userId);  // Lấy thông tin người dùng cũ trước khi thay đổi

      let avatarUrl = null;
      if (avatar) {
        // Kiểm tra nếu avatar là base64
        if (avatar.startsWith('data:image')) {
          // Nếu là base64, gọi hàm upload lên cloud (ví dụ Cloudinary)
          try {
            avatarUrl = await uploadAvatarToCloud(avatar);  // Upload ảnh base64 lên Cloudinary
          } catch (error) {
            return res.status(400).json({ message: 'Lỗi khi tải ảnh lên.' });
          }
        } else {
          // Nếu là file, kiểm tra và tải lên
          try {
            validateAvatar(avatar);  // Kiểm tra avatar nếu là file (định dạng và kích thước)
            avatarUrl = await uploadAvatarToCloud(avatar);  // Upload file lên Cloudinary
          } catch (error) {
            return res.status(400).json({ message: error.message });
          }
        }
      }

      // Cập nhật thông tin người dùng trong cơ sở dữ liệu
      await UserModel.updateProfile(userId, { name, avatarUrl });
      const updatedUser = await UserModel.getUserById(userId);

      // Lưu vào bảng `user_update_history` lịch sử thay đổi
      if (oldUser.name !== name) {
        await UserModel.saveUpdateHistory(userId, 'Name', oldUser.name, name);
      }
      if (oldUser.avatar_url !== avatarUrl) {
        await UserModel.saveUpdateHistory(userId, 'Avatar', oldUser.avatar_url, avatarUrl);
      }

      res.json({
        message: 'Cập nhật thông tin thành công',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật thông tin.' });
    }
  },

  /**
   * Reset password request
   */
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email không được để trống.' });
      }

      // Check if email exists
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Send reset email with encoded token
      const resetUrl = `${process.env.APP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
      await transporter.sendMail({
        to: email,
        subject: 'Đặt lại mật khẩu',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Đặt lại mật khẩu</h2>
            <p style="color: #666; line-height: 1.6;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
              Vui lòng click vào nút bên dưới để đặt lại mật khẩu.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #3498db; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Đặt lại mật khẩu
              </a>
            </div>
            <p style="color: #666; line-height: 1.6;">
              Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Link đặt lại mật khẩu này sẽ hết hạn sau 1 giờ.
            </p>
          </div>
        `
      });

      res.json({ message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.' });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi yêu cầu đặt lại mật khẩu.' });
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (req, res) => {
    try {
      const token = req.query.token;
      const {newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ message: 'Mật khẩu mới không được để trống.' });
      }

      try {
        // Decode the token if it's URL encoded
        const decodedToken = decodeURIComponent(token);
        
        // Verify token
        const decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);
        const userId = decoded.userId;

        if (!userId) {
          return res.status(400).json({ message: 'Token không hợp lệ.' });
        }

        // Get user
        const user = await UserModel.getUserById(userId);

        // Check if user exists and has password_hash
        if (!user || !user.password_hash) {
          return res.status(404).json({ message: 'Không tìm thấy người dùng hoặc mật khẩu không hợp lệ.' });
        }

        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
        if (isSamePassword) {
          return res.status(400).json({ message: 'Mật khẩu mới không thể giống mật khẩu cũ.' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password in database
        await UserModel.updatePassword(userId, passwordHash);

        // Logout all sessions
        await UserModel.logoutSession(userId);

        res.json({ message: 'Đặt lại mật khẩu thành công.' });
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError);
        if (jwtError.name === 'JsonWebTokenError') {
          return res.status(400).json({ message: 'Token không hợp lệ.' });
        }
        if (jwtError.name === 'TokenExpiredError') {
          return res.status(400).json({ message: 'Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu lại.' });
        }
        throw jwtError;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi đặt lại mật khẩu.' });
    }
  },

  /**
   * Resend verification email
   */
  resendverifyEmail: async (req, res) => {
    try {
      const { email } = req.body;

      // Check if email exists in pending registrations
      const pendingRegistration = await UserModel.findPendingByEmail(email);
      if (!pendingRegistration) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin đăng ký với email này.' });
      }

      // Generate new verification token
      const verificationToken = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update pending registration with new token
      await UserModel.updatePendingRegistrationToken(email, verificationToken);

      // Send verification email
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
      await transporter.sendMail({
        to: email,
        subject: 'Xác thực lại email của bạn',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Xác thực email của bạn</h2>
            <p style="color: #666; line-height: 1.6;">
              Cảm ơn bạn đã đăng ký tài khoản tại PlanCraft. Để hoàn tất quá trình đăng ký, 
              vui lòng click vào nút bên dưới để xác thực email của bạn.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #3498db; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Xác thực email
              </a>
            </div>
            <p style="color: #666; line-height: 1.6;">
              Nếu bạn không thực hiện đăng ký tài khoản này, vui lòng bỏ qua email này.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Link xác thực này sẽ hết hạn sau 24 giờ.
            </p>
          </div>
        `
      });

      res.json({ message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư đến của bạn.' });
    } catch (error) {
      console.error('Resend verification email error:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi gửi lại email xác thực.' });
    }
  },

  /**
   * Verify email
   */
  verifyEmail: async (req, res) => {
    try {
      const token = req.query.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;

      // Tìm trong bảng pending_registrations
      const pendingUser = await UserModel.findPendingByEmail(email);
      if (!pendingUser) {
        return res.status(404).json({ message: 'Đăng ký chờ không tồn tại hoặc đã xác thực.' });
      }

      // Tạo người dùng chính thức
      await UserModel.createUser({
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password_hash,
        is_email_verified: true
      });

      // Xóa bản ghi trong pending_registrations
      await UserModel.deletePendingRegistration(email);

      // Cập nhật trạng thái thành "inactive" trong active_sessions sau khi xác thực email
      const updateQuery = 'UPDATE active_sessions SET status = "inactive" WHERE token = ?';
      await db.query(updateQuery, [token]);

      res.json({ message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay.' });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
  },

  /**
   * Get user profile
   */
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id; // From auth middleware
      const user = await UserModel.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy thông tin người dùng.' });
    }
  }
};

module.exports = UserController;
