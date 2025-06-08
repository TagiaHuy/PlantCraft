// userModel.js
// Model for user-related database operations

const db = require('../services/db');  // Đảm bảo db đã được kết nối chính xác
const bcrypt = require('bcrypt');

/**
 * User model with database operations
 */
const UserModel = {
  /**
   * Tạo người dùng mới và mã hóa mật khẩu
   */
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

      console.log('[addSession] Thành công:', result);
    return result;  // Trả về kết quả với insertId
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Không thể tạo người dùng');
    }
  },

  /**
   * Tìm người dùng theo email
   */
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

  /**
   * Cập nhật thông tin người dùng (ví dụ: name, avatar_url)
   */
  updateProfile: async (userId, updateData) => {
    try {
      const query = 'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?';
      const params = [updateData.name, updateData.avatarUrl, userId];
      const result = await db.query(query, params);

      if (result.affectedRows === 0) {
        throw new Error('Không tìm thấy người dùng để cập nhật.');
      }
      // Lấy lại thông tin người dùng đã cập nhật
      const updatedUser = await UserModel.getUserById(userId);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Không thể cập nhật thông tin người dùng');
    }
  },

  /**
   * Cập nhật mật khẩu của người dùng (mã hóa mật khẩu mới)
   */
  updatePassword: async (userId, newPassword) => {
    try {
      const saltRounds = 10; // Đặt số vòng mã hóa cho bcrypt
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);  // Mã hóa mật khẩu mới

      const query = 'UPDATE users SET password_hash = ? WHERE id = ?';
      const result = await db.query(query, [passwordHash, userId]); // Cập nhật mật khẩu đã mã hóa vào cơ sở dữ liệu

      console.log('[addSession] Thành công:', result);
    return result;
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Không thể cập nhật mật khẩu');
    }
  },

  /**
   * Lấy thông tin người dùng theo ID
   */
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

  /**
   * Xác thực lại email
   */
  verifyEmail: async (userId) => {
    try {
      const query = 'UPDATE users SET is_email_verified = TRUE WHERE id = ?';
      
      const user = await UserModel.getUserById(userId);
      if (user.is_email_verified) {
        return { message: 'Email đã được xác thực trước đó.' };  // Trả về thông báo nếu email đã được xác thực
      }

      const result = await db.query(query, [userId]);
      console.log('[addSession] Thành công:', result);
    return result;  // Trả về kết quả cập nhật
    } catch (error) {
      console.error('Error verifying email:', error);
      throw new Error('Không thể xác thực email');
    }
  },

  /**
   * Xóa phiên đăng nhập của người dùng khỏi active_sessions
   */
  logoutSession: async (token) => {
    try {
      console.log('[logoutSession] Xóa session với token:', token);
      const query = 'UPDATE active_sessions SET logout_time = NOW() WHERE token = ? AND logout_time IS NULL';
      const result = await db.query(query, [token]);
      console.log('[logoutSession] Kết quả:', result);
      return result;
    } catch (error) {
      console.error('Error logging out session:', error);
      throw new Error('Không thể đăng xuất.');
    }
  },

  /**
   * Lấy thông tin người dùng từ active_sessions
   */
  getUserByIdAndToken: async (userId, token) => {
    try {
      const query = 'SELECT u.id, u.name, u.email, u.avatar_url, u.is_email_verified, u.created_at ' +
                    'FROM users u JOIN active_sessions s ON u.id = s.user_id WHERE u.id = ? AND s.token = ?';
      const results = await db.query(query, [userId, token]);
      return results.length > 0 ? results[0] : null;  // Trả về người dùng đầu tiên tìm thấy
    } catch (error) {
      console.error('Error getting user by ID and token:', error);
      throw new Error('Không thể lấy thông tin người dùng');
    }
  },

  /**
   * Kiểm tra đăng ký chờ
   */
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

  /**
   * Tạo đăng ký chờ (dành cho người dùng chưa xác thực email)
   */
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
      console.log('[addSession] Thành công:', result);
    return result;
    } catch (error) {
      console.error('Error creating pending registration:', error);
      throw new Error('Không thể tạo đăng ký chờ');
    }
  },

  /**
   * Xóa đăng ký chờ
   */
  deletePendingRegistration: async (email) => {
    try {
      const query = 'DELETE FROM pending_registrations WHERE email = ?';
      const result = await db.query(query, [email]);
      console.log('[addSession] Thành công:', result);
    return result;
    } catch (error) {
      console.error('Error deleting pending registration:', error);
      throw new Error('Không thể xóa đăng ký chờ');
    }
  },

  /**
   * Thêm session khi người dùng đăng nhập
   */
  addSession: async (userId, token) => {
    try {
      console.log('[addSession] Ghi session:', userId, token);
    const query = 'INSERT INTO active_sessions (user_id, token, login_time) VALUES (?, ?, NOW())';
      const result = await db.query(query, [userId, token]);
      console.log('[addSession] Thành công:', result);
    return result;
    } catch (error) {
      console.error('Error adding session:', error);
      throw new Error('Không thể tạo session');
    }
  },

  /**
   * Danh sách các user đang hoạt động
   */
  listActiveSessions: async () => {
    try {
      const query = `
        SELECT s.id, u.id AS user_id, u.name, u.email, s.login_time
        FROM active_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.logout_time IS NULL
        ORDER BY s.login_time DESC
      `;
      const results = await db.query(query);
      return results;
    } catch (error) {
      console.error('Error listing active sessions:', error);
      throw new Error('Không thể lấy danh sách phiên đăng nhập');
    }
  }
};

module.exports = UserModel;
