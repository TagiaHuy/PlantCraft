const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

/**
 * Middleware để xác thực JWT token khi người dùng đăng nhập
 */
const authenticateLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra xem token có chứa userId không
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Token không hợp lệ.' });
    }

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await UserModel.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại.' });
    }

    // Gắn thông tin người dùng vào req
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi xác thực.' });
  }
};

/**
 * Middleware để xác thực email đã được xác thực
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user.is_email_verified) {
    return res.status(403).json({ 
      message: 'Vui lòng xác thực email trước khi thực hiện thao tác này.' 
    });
  }
  next();
};

module.exports = {
  authenticateToken: authenticateLogin,
  requireEmailVerified
};
