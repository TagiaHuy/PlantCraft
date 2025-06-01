-- Tạo database
CREATE DATABASE IF NOT EXISTS plantcraft;
USE plantcraft;

-- Bảng users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) COMMENT 'Tên người dùng',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Địa chỉ email (không được trùng, không được để trống)',
    password_hash TEXT COMMENT 'Mã hóa mật khẩu',
    avatar_url TEXT COMMENT 'URL ảnh đại diện',
    is_email_verified BOOLEAN DEFAULT FALSE COMMENT 'Email đã xác thực hay chưa',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo tài khoản'
);

-- Bảng plants
CREATE TABLE IF NOT EXISTS plants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên cây',
    species VARCHAR(100) COMMENT 'Loài cây',
    care_instructions TEXT COMMENT 'Hướng dẫn chăm sóc',
    water_frequency VARCHAR(50) COMMENT 'Tần suất tưới nước',
    user_id INT COMMENT 'ID người dùng sở hữu',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table for pending user registrations
CREATE TABLE pending_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    verification_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Chỉ mục
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_plant_user ON plants(user_id);

-- Dữ liệu mẫu cho plants
INSERT INTO plants (name, species, care_instructions, water_frequency) VALUES
('Cây Trầu Bà', 'Epipremnum aureum', 'Đặt nơi có ánh sáng gián tiếp, tưới nước khi đất khô', 'Mỗi 5-7 ngày'),
('Cây Lưỡi Hổ', 'Sansevieria trifasciata', 'Chịu được bóng râm, tưới nước ít', 'Mỗi 2-3 tuần'),
('Cây Phát Tài', 'Dracaena sanderiana', 'Ánh sáng vừa phải, giữ đất ẩm', 'Mỗi 3-4 ngày');