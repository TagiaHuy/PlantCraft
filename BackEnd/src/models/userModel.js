// userModel.js
// Model for user-related database operations

const db = require('../services/db');  // Đảm bảo db đã được kết nối chính xác
const bcrypt = require('bcrypt');

/**
 * User model with database operations
 */
const UserModel = {
  createUser: async (userData) => {
    try {
      // Nếu mật khẩu đã được mã hóa, không cần mã hóa lại
      let passwordHash = userData.password;

      // Kiểm tra xem mật khẩu đã được mã hóa chưa
      if (!userData.password.startsWith('$2b$')) {  // Kiểm tra xem mật khẩu đã được mã hóa hay chưa
        const saltRounds = 10;
        passwordHash = await bcrypt.hash(userData.password, saltRounds);  // Mã hóa mật khẩu nếu chưa được mã hóa
      }

      const query = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';
      const params = [userData.name, userData.email, passwordHash];
      const result = await db.query(query, params);

      return result;  // Trả về kết quả với insertId
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Không thể tạo người dùng');
    }
  },

  findByEmail: async (email) => {
    try {
      const query = 'SELECT * FROM users WHERE email = ?';
      const results = await db.query(query, [email]);
      return results.length > 0 ? results[0] : null;  // Trả về null nếu không tìm thấy người dùng
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Không thể tìm thấy người dùng');
    }
  },

  updateProfile: async (userId, updateData) => {
    try {
      const query = 'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?';
      const params = [updateData.name, updateData.avatarUrl, userId];
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Không thể cập nhật thông tin người dùng');
    }
  },

  updatePassword: async (userId, newPassword) => {
    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);  // Mã hóa mật khẩu mới

      const query = 'UPDATE users SET password_hash = ? WHERE id = ?';
      const result = await db.query(query, [passwordHash, userId]);
      return result;
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Không thể cập nhật mật khẩu');
    }
  },

  verifyEmail: async (userId) => {
    try {
      const query = 'UPDATE users SET is_email_verified = TRUE WHERE id = ?';
      
      const user = await UserModel.getUserById(userId);
      if (user.is_email_verified) {
        return { message: 'Email đã được xác thực trước đó.' };  // Trả về thông báo nếu email đã được xác thực
      }

      const result = await db.query(query, [userId]);
      return result;  // Trả về kết quả cập nhật
    } catch (error) {
      console.error('Error verifying email:', error);
      throw new Error('Không thể xác thực email');
    }
  },

  getUserById: async (userId) => {
    try {
      const query = 'SELECT id, name, email, avatar_url, is_email_verified, created_at FROM users WHERE id = ?';
      const results = await db.query(query, [userId]);
      return results[0];  // Trả về người dùng đầu tiên tìm thấy
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Không thể lấy thông tin người dùng');
    }
  },

  findPendingByEmail: async (email) => {
    try {
      const query = 'SELECT * FROM pending_registrations WHERE email = ?';
      const results = await db.query(query, [email]);
      return results.length > 0 ? results[0] : null;  // Trả về null nếu không tìm thấy đăng ký chờ
    } catch (error) {
      console.error('Error finding pending registration:', error);
      throw new Error('Không thể tìm thấy đăng ký chờ');
    }
  },

  createPendingRegistration: async (registrationData) => {
    try {
      const query = 'INSERT INTO pending_registrations (name, email, password_hash, verification_token, expires_at) VALUES (?, ?, ?, ?, ?)';
      const params = [
        registrationData.name,
        registrationData.email,
        registrationData.passwordHash,
        registrationData.verificationToken,
        registrationData.expiresAt
      ];
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error('Error creating pending registration:', error);
      throw new Error('Không thể tạo đăng ký chờ');
    }
  },

  deletePendingRegistration: async (email) => {
    try {
      const query = 'DELETE FROM pending_registrations WHERE email = ?';
      const result = await db.query(query, [email]);
      return result;
    } catch (error) {
      console.error('Error deleting pending registration:', error);
      throw new Error('Không thể xóa đăng ký chờ');
    }
  }
};

module.exports = UserModel;
