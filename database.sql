
create database PlanCraft
use PlanCraft

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) COMMENT 'Tên người dùng',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Địa chỉ email (không được trùng, không được để trống)',
    password_hash TEXT COMMENT 'Mã hóa mật khẩu',
    avatar_url TEXT COMMENT 'URL ảnh đại diện',
    is_email_verified BOOLEAN DEFAULT FALSE COMMENT 'Email đã xác thực hay chưa',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo tài khoản'
);


CREATE TABLE pending_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    verification_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE active_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  logout_time DATETIME DEFAULT NULL
);


ALTER TABLE pending_registrations ADD INDEX idx_verification_token (verification_token);

CREATE TABLE goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('in_progress', 'completed', 'cancelled') DEFAULT 'in_progress',
  progress INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE goal_phases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  goal_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  order_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);


CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  goal_id INT,
  phase_id INT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  deadline DATETIME NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

