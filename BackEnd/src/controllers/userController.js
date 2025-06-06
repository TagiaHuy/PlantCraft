// userController.js
// Controller for user-related operations

const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

const UserController = {
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

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Email không đúng.' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Mật khẩu không đúng.' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Đăng nhập thành công',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatar_url,
          isEmailVerified: user.is_email_verified
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
      const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Get token from Authorization header
      if (!token) {
        return res.status(400).json({ message: 'Token không hợp lệ.' });
      }
      // Add token to blacklist or handle session invalidation here if needed
      const result = await UserModel.logoutSession(token);

      if (result.affectedRows === 0) {
        return res.status(400).json({ message: 'Không tìm thấy phiên đăng nhập để đăng xuất.' });
      }

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
      // Get user information from database
      const user = await UserModel.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
      }

      // Return user information
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
      const userId = req.user.id; // From auth middleware
      const { name, avatarUrl } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Tên không được để trống.' });
      }

      await UserModel.updateProfile(userId, { name, avatarUrl });
      const updatedUser = await UserModel.getUserById(userId);

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

      // Check if email invalid
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

      // Send reset email
      const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
      await transporter.sendMail({
        to: email,
        subject: 'Đặt lại mật khẩu',
        html: `Click vào link sau để đặt lại mật khẩu: <a href="${resetUrl}">Đặt lại mật khẩu</a>`
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
      const { token, newPassword } = req.body;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password in database
      await UserModel.updatePassword(userId, passwordHash);

      res.json({ message: 'Đặt lại mật khẩu thành công.' });
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
      }
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi đặt lại mật khẩu.' });
    }
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (req, res) => {
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
            <h2 style="color: #2c3e50;">Xác thực lại email của bạn</h2>
            <p style="color: #666; line-height: 1.6;">
              Bạn đã yêu cầu gửi lại link xác thực. Vui lòng click vào nút bên dưới để xác thực email của bạn.
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
      const { token } = req.query;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { email } = decoded;

      // Get pending registration
      const pendingRegistration = await UserModel.findPendingByEmail(email);
      if (!pendingRegistration) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin đăng ký.' });
      }

      // Check if token matches
      if (pendingRegistration.verification_token !== token) {
        return res.status(400).json({ message: 'Token không hợp lệ.' });
      }

      // Check if token has expired
      if (new Date() > new Date(pendingRegistration.expires_at)) {
        return res.status(400).json({ message: 'Token đã hết hạn. Vui lòng đăng ký lại.' });
      }

      // Create user in database
      await UserModel.createUser({
        name: pendingRegistration.name,
        email: pendingRegistration.email,
        password: pendingRegistration.password_hash
      });

      // Delete pending registration
      await UserModel.deletePendingRegistration(email);

      res.json({ message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.' });
    } catch (error) {
      console.error('Email verification error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
      }
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi xác thực email.' });
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
