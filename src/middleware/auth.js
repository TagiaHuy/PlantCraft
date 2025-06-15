// Authentication middleware

const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập để tiếp tục.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra xem token có chứa userId không
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Token không hợp lệ. Vui lòng đăng nhập lại.' });
    }

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await UserModel.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại. Vui lòng đăng nhập lại.' });
    }

    // Gắn thông tin người dùng vào req
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    // Nếu token không hợp lệ hoặc đã hết hạn
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' });
    }

    // Các lỗi khác
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi xác thực. Vui lòng thử lại sau.' });
  }
};

/**
 * Middleware để xác thực email đã được xác thực
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user.is_email_verified) {
    return res.status(403).json({ 
      message: 'Tài khoản của bạn chưa được xác thực email. Vui lòng kiểm tra email của bạn để hoàn tất đăng ký.' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireEmailVerified
};
