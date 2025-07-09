# Database Setup Guide

## Tự động tạo Database

Dự án này có tính năng **tự động tạo database** nếu chưa tồn tại. Có 2 cách để setup:

### Cách 1: Tự động khi khởi động ứng dụng

Khi bạn chạy ứng dụng, nó sẽ tự động:
1. Tạo database nếu chưa tồn tại
2. Tạo tất cả bảng từ file `database.sql`
3. Khởi động server

```bash
npm start
```

### Cách 2: Setup database riêng biệt

Chạy script setup database trước:

```bash
npm run setup-db
```

Sau đó khởi động ứng dụng:

```bash
npm start
```

### Cách 3: Setup và khởi động cùng lúc

```bash
npm run init
```

## Cấu hình Database

### 1. Tạo file `.env`

Tạo file `.env` trong thư mục gốc với nội dung:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=plantcraft_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Email Configuration (for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server Configuration
PORT=3000
NODE_ENV=development

# Password Reset Configuration
PASSWORD_RESET_EXPIRES_IN=1h
```

### 2. Cài đặt MySQL

Đảm bảo MySQL đã được cài đặt và đang chạy:

```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# macOS
brew install mysql

# Windows
# Tải MySQL từ https://dev.mysql.com/downloads/mysql/
```

### 3. Tạo user MySQL (tùy chọn)

```sql
CREATE USER 'plantcraft_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON plantcraft_db.* TO 'plantcraft_user'@'localhost';
FLUSH PRIVILEGES;
```

## Cấu trúc Database

Dự án sẽ tự động tạo các bảng sau:

- `users` - Thông tin người dùng
- `pending_registrations` - Đăng ký chờ xác thực
- `active_sessions` - Phiên đăng nhập
- `goal_groups` - Nhóm mục tiêu
- `goals` - Mục tiêu
- `goal_phases` - Giai đoạn mục tiêu
- `tasks` - Nhiệm vụ
- `plants` - Cây trồng
- `user_update_history` - Lịch sử thay đổi

## Troubleshooting

### Lỗi kết nối database

1. Kiểm tra MySQL đang chạy:
```bash
sudo systemctl status mysql
```

2. Kiểm tra thông tin kết nối trong `.env`

3. Test kết nối:
```bash
mysql -u root -p
```

### Lỗi quyền truy cập

```sql
GRANT ALL PRIVILEGES ON plantcraft_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Reset database

```bash
# Xóa và tạo lại database
mysql -u root -p -e "DROP DATABASE IF EXISTS plantcraft_db; CREATE DATABASE plantcraft_db;"

# Chạy setup lại
npm run setup-db
```

## Logs

Khi setup database, bạn sẽ thấy logs như:

```
🚀 Starting database setup...
✅ Connected to MySQL server
✅ Database 'plantcraft_db' is ready
✅ Connected to database
📝 Found 25 SQL statements to execute
✅ Executed statement 1/25
✅ Executed statement 2/25
...
📊 Setup Summary:
✅ Successful statements: 25
❌ Failed statements: 0
📝 Total statements: 25

📋 Created tables:
  - users
  - pending_registrations
  - active_sessions
  - goal_groups
  - goals
  - goal_phases
  - tasks
  - plants
  - user_update_history

🎉 Database setup completed successfully!
``` 