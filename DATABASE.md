# Tài Liệu Cơ Sở Dữ Liệu PlantCraft

Tài liệu này mô tả chi tiết về cấu trúc và quản lý cơ sở dữ liệu của hệ thống PlantCraft.

## Tổng Quan

### Thông Tin Kỹ Thuật
- Database Engine: MySQL 8.0
- Character Set: UTF-8
- Collation: utf8mb4_unicode_ci

## Cấu Trúc Database

### Bảng Users
```sql

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


-- Indexes
-- CREATE INDEX idx_email ON users(email);
```

### Bảng Goals
```sql
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

-- Indexes
CREATE INDEX idx_user_goals ON goals(user_id);
CREATE INDEX idx_status ON goals(status);
```

### Bảng Goal_Phases
```sql
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

-- Indexes
CREATE INDEX idx_goal_phases ON goal_phases(goal_id);
```

### Bảng Tasks
```sql
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL,
  FOREIGN KEY (phase_id) REFERENCES goal_phases(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_user_tasks ON tasks(user_id);
CREATE INDEX idx_goal_tasks ON tasks(goal_id);
CREATE INDEX idx_phase_tasks ON tasks(phase_id);
CREATE INDEX idx_task_status ON tasks(status);
CREATE INDEX idx_task_deadline ON tasks(deadline);
```

### Bảng Plants
```sql
CREATE TABLE plants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(100),
  description TEXT,
  planting_date DATE,
  watering_frequency INT,
  last_watered_at DATETIME,
  notes TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_user_plants ON plants(user_id);
```

## Quan Hệ Giữa Các Bảng

### Users - Goals
- Một user có thể có nhiều goals (1:N)
- Khi xóa user, tất cả goals của user đó sẽ bị xóa (CASCADE)

### Goals - Phases
- Một goal có thể có nhiều phases (1:N)
- Khi xóa goal, tất cả phases của goal đó sẽ bị xóa (CASCADE)

### Goals/Phases - Tasks
- Một goal có thể có nhiều tasks (1:N)
- Một phase có thể có nhiều tasks (1:N)
- Khi xóa goal/phase, các tasks liên quan sẽ được giữ lại nhưng goal_id/phase_id sẽ được set NULL

### Users - Plants
- Một user có thể có nhiều plants (1:N)
- Khi xóa user, tất cả plants của user đó sẽ bị xóa (CASCADE)

## Bảo Mật Dữ Liệu

### Mật Khẩu
- Mật khẩu được mã hóa bằng bcrypt trước khi lưu vào database
- Không bao giờ lưu trữ mật khẩu dạng plain text

### Tokens
- Verification token và reset token được tạo ngẫu nhiên
- Reset token có thời hạn sử dụng (expires)

## Backup & Recovery

### Backup Strategy
```bash
# Backup toàn bộ database
mysqldump -u [user] -p [database_name] > backup_full_$(date +%Y%m%d).sql

# Backup chỉ cấu trúc
mysqldump -u [user] -p --no-data [database_name] > backup_structure_$(date +%Y%m%d).sql

# Backup chỉ dữ liệu
mysqldump -u [user] -p --no-create-info [database_name] > backup_data_$(date +%Y%m%d).sql
```

### Recovery Process
```bash
# Khôi phục database
mysql -u [user] -p [database_name] < backup_file.sql
```

## Maintenance

### Tối Ưu Hiệu Năng
```sql
-- Phân tích và tối ưu bảng
ANALYZE TABLE users, goals, tasks, plants;

-- Tối ưu indexes
OPTIMIZE TABLE users, goals, tasks, plants;
```

### Monitoring
```sql
-- Kiểm tra status của bảng
SHOW TABLE STATUS;

-- Xem thông tin về indexes
SHOW INDEX FROM tasks;

-- Kiểm tra các queries đang chạy
SHOW PROCESSLIST;
```

## Migrations

### Tạo Migration
```sql
-- Ví dụ: Thêm cột vào bảng tasks
ALTER TABLE tasks
ADD COLUMN estimated_hours DECIMAL(5,2) AFTER deadline;

-- Ví dụ: Thêm index mới
CREATE INDEX idx_task_priority ON tasks(priority);
```

### Rollback Migration
```sql
-- Ví dụ: Xóa cột đã thêm
ALTER TABLE tasks
DROP COLUMN estimated_hours;

-- Ví dụ: Xóa index đã thêm
DROP INDEX idx_task_priority ON tasks;
```