-- Bảng người dùng (users)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên người dùng',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Địa chỉ email người dùng',
    password_hash TEXT COMMENT 'Mã hoá mật khẩu',
    avatar_url TEXT COMMENT 'URL ảnh đại diện của người dùng',
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
    goal_id INT NULL COMMENT 'ID mục tiêu',  -- Thay đổi thành NULL
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


-- Bảng cây trồng (plants)
CREATE TABLE plants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên cây trồng',
    species VARCHAR(100) COMMENT 'Loài cây',
    care_instructions TEXT COMMENT 'Hướng dẫn chăm sóc cây',
    water_frequency INT COMMENT 'Tần suất tưới nước (số ngày)',
    user_id INT NOT NULL COMMENT 'ID người dùng sở hữu cây',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo cây trồng',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật cây trồng',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Ngày 14.06.25 --

-- Cập nhật bảng active_sessions, thêm cột created_at, status, logged_in_at
ALTER TABLE active_sessions
ADD COLUMN expired_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời gian hết hạn của phiên đăng nhập',
ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Trạng thái phiên đăng nhập',
ADD COLUMN logged_out_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời gian đăng xuất của phiên đăng nhập';

-- Bảng Lịch sử thay đổi thông tin người dùng (user_update_history)
CREATE TABLE user_update_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  update_type VARCHAR(255) NOT NULL,  -- Loại thay đổi (Ví dụ: 'Tên', 'Ảnh đại diện')
  old_value TEXT,                     -- Giá trị cũ
  new_value TEXT,                     -- Giá trị mới
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian thay đổi
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ngày 17.06.25 --

-- Cập nhật bảng user_update_history
-- Thêm trường `old_value` để lưu giá trị trước khi thay đổi
ALTER TABLE user_update_history
ADD COLUMN old_value TEXT COMMENT 'Giá trị cũ của thông tin người dùng';
-- Thêm trường `new_value` để lưu giá trị sau khi thay đổi
ADD COLUMN new_value TEXT COMMENT 'Giá trị mới của thông tin người dùng';
-- Thêm trường `updated_at` để lưu thời gian thay đổi
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian thay đổi';
-- Thêm trường `update_type` để phân loại thay đổi (Cập nhật tên, ảnh đại diện, mật khẩu, v.v.)
ADD COLUMN update_type VARCHAR(255) COMMENT 'Loại thay đổi (Ví dụ: Cập nhật tên, Cập nhật ảnh đại diện)';
-- Thêm trường `changed_by_role` để ghi lại vai trò của người thực hiện thay đổi
ADD COLUMN changed_by_role VARCHAR(100) COMMENT 'Vai trò của người thực hiện thay đổi (user, admin)';
-- Thêm trường `reason` để lưu lý do thay đổi
ADD COLUMN reason TEXT COMMENT 'Lý do thay đổi';
-- Thêm trường `ip_address` để ghi nhận địa chỉ IP của người thực hiện thay đổi
ADD COLUMN ip_address VARCHAR(45) COMMENT 'Địa chỉ IP của người thực hiện thay đổi';
-- Thêm trường `user_agent` để ghi nhận thông tin trình duyệt hoặc thiết bị
ADD COLUMN user_agent TEXT COMMENT 'Thông tin về trình duyệt hoặc thiết bị của người thực hiện thay đổi';
-- Thêm trường `is_deleted` để xử lý các thay đổi bị hủy (nếu có)
MODIFY COLUMN is_deleted TINYINT DEFAULT 0 COMMENT 'Trạng thái thay đổi đã bị hủy';

-- Cập nhật bảng users
ALTER TABLE users
MODIFY COLUMN avatar_url VARCHAR(255) COMMENT 'URL ảnh đại diện của người dùng';
-- Thêm chỉ mục cho trường email
CREATE INDEX idx_email ON users(email);
-- Kiểm tra lại kiểu dữ liệu avatar_url
ALTER TABLE users MODIFY COLUMN avatar_url VARCHAR(255);

-- Cập nhật bảng pending_registrations
-- Đảm bảo rằng `password_hash` có kiểu dữ liệu hợp lý
ALTER TABLE pending_registrations MODIFY COLUMN password_hash VARCHAR(255);
-- Kiểm tra chỉ mục cho `email`
CREATE INDEX idx_pending_email ON pending_registrations(email);
-- Kiểm tra lại kiểu dữ liệu verification_token
ALTER TABLE pending_registrations MODIFY COLUMN verification_token VARCHAR(255);

-- Cập nhật bảng active_sessions
-- Thêm chỉ mục cho trường `user_id`
CREATE INDEX idx_user_id_sessions ON active_sessions(user_id);

-- Cập nhật bảng users_update_history
-- Thêm chỉ mục cho `user_id` để tăng tốc truy vấn
CREATE INDEX idx_user_id_history ON user_update_history(user_id);
-- Thêm chỉ mục cho các trường cần truy vấn thường xuyên
CREATE INDEX idx_updated_at_history ON user_update_history(updated_at);
CREATE INDEX idx_update_type_history ON user_update_history(update_type);
-- Đảm bảo các trường mới được cập nhật đúng
ALTER TABLE user_update_history ADD COLUMN changed_by_role VARCHAR(100) COMMENT 'Vai trò của người thực hiện thay đổi (user, admin)';
ALTER TABLE user_update_history ADD COLUMN reason TEXT COMMENT 'Lý do thay đổi';
ALTER TABLE user_update_history ADD COLUMN ip_address VARCHAR(45) COMMENT 'Địa chỉ IP của người thực hiện thay đổi';
ALTER TABLE user_update_history ADD COLUMN user_agent TEXT COMMENT 'Thông tin về trình duyệt hoặc thiết bị của người thực hiện thay đổi';

