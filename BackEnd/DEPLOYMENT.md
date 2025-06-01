# Hướng Dẫn Triển Khai PlantCraft Backend

Tài liệu này mô tả chi tiết quy trình triển khai hệ thống PlantCraft Backend từ môi trường phát triển đến production.

## Yêu Cầu Hệ Thống

### Phần Mềm
- Node.js (v16 trở lên)
- MySQL (v8.0 trở lên)
- Git
- PM2 (cho production)

### Tài Nguyên Server
- CPU: 2 cores trở lên
- RAM: 4GB trở lên
- Disk: 20GB trở lên
- OS: Ubuntu 20.04 LTS hoặc mới hơn

## Môi Trường Development

### 1. Cài Đặt Development

```bash
# Clone repository
git clone <repository-url>
cd plantcraft-backend

# Cài đặt dependencies
npm install

# Tạo file môi trường
cp .env.example .env

# Cấu hình file .env
nano .env
```

### 2. Cấu Hình Database

```bash
# Tạo database
mysql -u root -p
CREATE DATABASE plantcraft;

# Import schema
mysql -u root -p plantcraft < database.sql
```

### 3. Khởi Động Development Server

```bash
# Chạy với nodemon
npm run dev
```

## Môi Trường Staging

### 1. Cài Đặt Staging Server

```bash
# Cập nhật hệ thống
sudo apt update
sudo apt upgrade

# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Cài đặt MySQL
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. Triển Khai Ứng Dụng

```bash
# Clone và cài đặt
git clone <repository-url>
cd plantcraft-backend
npm install

# Cấu hình môi trường
cp .env.example .env.staging
nano .env.staging

# Khởi động ứng dụng
NODE_ENV=staging npm start
```

## Môi Trường Production

### 1. Chuẩn Bị Server

```bash
# Cài đặt PM2
sudo npm install -g pm2

# Cài đặt Nginx
sudo apt install nginx
```

### 2. Cấu Hình Nginx

```nginx
server {
    listen 80;
    server_name api.plantcraft.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. SSL Configuration

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx

# Tạo SSL certificate
sudo certbot --nginx -d api.plantcraft.com
```

### 4. Triển Khai Production

```bash
# Clone repository
git clone <repository-url>
cd plantcraft-backend

# Cài đặt dependencies
npm install --production

# Cấu hình môi trường
cp .env.example .env.production
nano .env.production

# Khởi động với PM2
pm2 start ecosystem.config.js --env production
```

## Cấu Hình Môi Trường

### Development (.env)
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=plantcraft

# JWT
JWT_SECRET=dev_secret_key
JWT_EXPIRES_IN=1d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_ADDRESS=your@email.com
EMAIL_PASSWORD=your_app_password
```

### Production (.env.production)
```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_USER=plantcraft
DB_PASS=strong_password
DB_NAME=plantcraft_prod

# JWT
JWT_SECRET=strong_production_secret
JWT_EXPIRES_IN=1d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
EMAIL_ADDRESS=production@plantcraft.com
EMAIL_PASSWORD=production_app_password
```

## Quy Trình Cập Nhật

### 1. Backup Dữ Liệu

```bash
# Backup database
mysqldump -u root -p plantcraft > backup_$(date +%Y%m%d).sql

# Backup .env
cp .env .env.backup
```

### 2. Cập Nhật Code

```bash
# Pull code mới
git pull origin main

# Cài đặt dependencies mới
npm install

# Chạy migration (nếu có)
npm run migrate
```

### 3. Khởi Động Lại Server

```bash
# Khởi động lại PM2
pm2 reload all

# Kiểm tra logs
pm2 logs
```

## Monitoring

### 1. PM2 Monitoring

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs

# Xem metrics
pm2 monit
```

### 2. Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### 3. Application Logs

```bash
# Xem logs theo thời gian thực
tail -f logs/app.log

# Xem error logs
tail -f logs/error.log
```

## Khắc Phục Sự Cố

### 1. Kiểm Tra Trạng Thái Server

```bash
# Kiểm tra status của các service
sudo systemctl status nginx
pm2 status

# Kiểm tra port đang sử dụng
sudo netstat -tulpn | grep LISTEN
```

### 2. Rollback

```bash
# Rollback code
git reset --hard <commit_hash>

# Restore database
mysql -u root -p plantcraft < backup_file.sql

# Restore .env
cp .env.backup .env
```

### 3. Common Issues

- **502 Bad Gateway**: Kiểm tra PM2 và Nginx status
- **Database Connection**: Verify database credentials và network
- **Email không gửi được**: Kiểm tra SMTP settings
- **Memory Issues**: Kiểm tra PM2 logs và system resources

## Security Checklist

- [ ] Cấu hình firewall (UFW)
- [ ] Secure MySQL installation
- [ ] SSL certificates
- [ ] Rate limiting
- [ ] Security headers trong Nginx
- [ ] Regular security updates
- [ ] Backup strategy
- [ ] Monitoring setup