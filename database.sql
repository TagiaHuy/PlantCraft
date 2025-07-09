-- Bảng người dùng (users)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên người dùng',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Địa chỉ email người dùng',
    password_hash TEXT COMMENT 'Mã hoá mật khẩu',
    avatar_url VARCHAR(255) COMMENT 'URL ảnh đại diện của người dùng',
    is_email_verified BOOLEAN DEFAULT FALSE COMMENT 'Trạng thái xác thực email',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo tài khoản',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật tài khoản'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng đăng ký chờ xác thực email (pending_registrations)
CREATE TABLE pending_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Tên người dùng',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Địa chỉ email người dùng',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Mã hoá mật khẩu',
    verification_token VARCHAR(255) NOT NULL COMMENT 'Mã xác thực email',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo đăng ký',
    expires_at TIMESTAMP NOT NULL COMMENT 'Thời gian hết hạn mã xác thực'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng phiên đăng nhập (active_sessions)
CREATE TABLE active_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'ID người dùng',
    token TEXT NOT NULL COMMENT 'JWT token',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo phiên đăng nhập',
    expired_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời gian hết hạn của phiên đăng nhập',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Trạng thái phiên đăng nhập',
    logged_out_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời gian đăng xuất của phiên đăng nhập',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng nhóm mục tiêu (goal_groups)
CREATE TABLE goal_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên nhóm mục tiêu',
    description TEXT COMMENT 'Mô tả nhóm mục tiêu',
    user_id INT NOT NULL COMMENT 'ID người dùng sở hữu nhóm mục tiêu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo nhóm mục tiêu',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng mục tiêu (goals)
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Tên mục tiêu',
    description TEXT COMMENT 'Mô tả mục tiêu',
    deadline DATE NOT NULL COMMENT 'Thời gian hoàn thành mục tiêu',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT 'Độ ưu tiên của mục tiêu',
    status ENUM('not_started', 'in_progress', 'completed', 'cancelled') DEFAULT 'not_started' COMMENT 'Trạng thái mục tiêu',
    progress INT DEFAULT 0 COMMENT 'Tiến độ mục tiêu (tính bằng phần trăm)',
    group_id INT COMMENT 'ID nhóm mục tiêu',
    user_id INT NOT NULL COMMENT 'ID người dùng sở hữu mục tiêu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo mục tiêu',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật mục tiêu',
    FOREIGN KEY (group_id) REFERENCES goal_groups(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng các giai đoạn của mục tiêu (goal_phases)
CREATE TABLE goal_phases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goal_id INT NOT NULL COMMENT 'ID mục tiêu',
    title VARCHAR(200) NOT NULL COMMENT 'Tên giai đoạn mục tiêu',
    description TEXT COMMENT 'Mô tả giai đoạn mục tiêu',
    order_number INT NOT NULL COMMENT 'Vị trí giai đoạn trong lộ trình',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo giai đoạn',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật giai đoạn',
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng nhiệm vụ (tasks)
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goal_id INT NULL COMMENT 'ID mục tiêu',
    phase_id INT COMMENT 'ID giai đoạn mục tiêu (nếu có)',
    user_id INT NOT NULL COMMENT 'ID người dùng thực hiện nhiệm vụ',
    title VARCHAR(255) NOT NULL COMMENT 'Tên nhiệm vụ',
    description TEXT COMMENT 'Mô tả nhiệm vụ',
    deadline DATETIME NOT NULL COMMENT 'Thời gian hoàn thành nhiệm vụ',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT 'Độ ưu tiên nhiệm vụ',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT 'Trạng thái nhiệm vụ',
    completed_at DATETIME COMMENT 'Thời gian hoàn thành nhiệm vụ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo nhiệm vụ',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật nhiệm vụ',
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL,
    FOREIGN KEY (phase_id) REFERENCES goal_phases(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Lịch sử thay đổi thông tin người dùng (user_update_history)
CREATE TABLE user_update_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    update_type VARCHAR(255) NOT NULL COMMENT 'Loại thay đổi (Ví dụ: Cập nhật tên, Cập nhật ảnh đại diện)',
    old_value TEXT COMMENT 'Giá trị cũ của thông tin người dùng',
    new_value TEXT COMMENT 'Giá trị mới của thông tin người dùng',
    changed_by_role VARCHAR(100) COMMENT 'Vai trò của người thực hiện thay đổi (user, admin)',
    reason TEXT COMMENT 'Lý do thay đổi',
    ip_address VARCHAR(45) COMMENT 'Địa chỉ IP của người thực hiện thay đổi',
    user_agent TEXT COMMENT 'Thông tin về trình duyệt hoặc thiết bị của người thực hiện thay đổi',
    is_deleted TINYINT DEFAULT 0 COMMENT 'Trạng thái thay đổi đã bị hủy',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian thay đổi',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tạo các chỉ mục (indexes)
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_pending_email ON pending_registrations(email);
CREATE INDEX idx_user_id_sessions ON active_sessions(user_id);
CREATE INDEX idx_user_id_history ON user_update_history(user_id);
CREATE INDEX idx_updated_at_history ON user_update_history(updated_at);
CREATE INDEX idx_update_type_history ON user_update_history(update_type);

