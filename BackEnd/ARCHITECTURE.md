# Kiến Trúc Hệ Thống PlantCraft

Tài liệu này mô tả chi tiết về kiến trúc và cấu trúc của hệ thống PlantCraft Backend.

## Tổng Quan Kiến Trúc

### Kiến Trúc MVC
Hệ thống được xây dựng theo mô hình MVC (Model-View-Controller) để tách biệt các thành phần logic:

- **Models**: Xử lý tương tác với cơ sở dữ liệu và định nghĩa cấu trúc dữ liệu
- **Controllers**: Xử lý logic nghiệp vụ và điều hướng request/response
- **Routes**: Định nghĩa các endpoint API và middleware

### Cấu Trúc Thư Mục
```
src/
├── controllers/     # Xử lý logic nghiệp vụ
├── middleware/      # Middleware xác thực và bảo mật
├── models/          # Tương tác với cơ sở dữ liệu
├── routes/          # Định nghĩa API endpoints
├── services/        # Các service như kết nối database
└── index.js         # Entry point
```

## Các Thành Phần Chính

### 1. Database Layer

#### Kết Nối Database
- Sử dụng MySQL thông qua thư viện mysql2
- Connection pool để quản lý kết nối hiệu quả
- Cấu hình trong `services/db.js`

#### Cấu Trúc Database
- Bảng `users`: Quản lý thông tin người dùng
- Bảng `goals`: Lưu trữ mục tiêu cá nhân
- Bảng `tasks`: Quản lý nhiệm vụ
- Bảng `plants`: Thông tin cây trồng

### 2. Authentication & Authorization

#### JWT Authentication
- Sử dụng JSON Web Tokens cho xác thực
- Token được tạo khi đăng nhập và gửi trong header
- Middleware kiểm tra và xác thực token

#### Email Verification
- Gửi email xác thực qua Nodemailer
- Tạo và xác thực token email
- Cập nhật trạng thái xác thực người dùng

### 3. Business Logic Layer

#### User Management
- Đăng ký và xác thực người dùng
- Quản lý thông tin cá nhân
- Đặt lại mật khẩu và bảo mật

#### Goal & Task Management
- CRUD operations cho mục tiêu
- Quản lý nhiệm vụ và tiến độ
- Tính toán và cập nhật tiến độ

#### Plant Management
- Quản lý thông tin cây trồng
- Theo dõi trạng thái và lịch sử

## Luồng Xử Lý Request

1. **Request Handling**
   - Request đến API endpoint
   - Router định tuyến đến controller phù hợp
   - Middleware xác thực (nếu cần)

2. **Business Logic**
   - Controller xử lý logic nghiệp vụ
   - Tương tác với model để truy xuất/cập nhật dữ liệu
   - Xử lý lỗi và validation

3. **Response Generation**
   - Format dữ liệu response
   - Trả về kết quả cho client

## Bảo Mật

### 1. Authentication
- JWT cho xác thực API
- Refresh token mechanism
- Rate limiting cho API endpoints

### 2. Data Security
- Mã hóa mật khẩu với bcrypt
- Sanitize input data
- Validation dữ liệu

### 3. Error Handling
- Xử lý lỗi tập trung
- Log lỗi chi tiết
- Response format chuẩn

## Tối Ưu Hiệu Năng

### 1. Database
- Connection pooling
- Index cho các trường tìm kiếm
- Query optimization

### 2. API
- Response caching
- Pagination cho danh sách
- Compression middleware

## Khả Năng Mở Rộng

### 1. Cấu Trúc Module
- Thiết kế module độc lập
- Dễ dàng thêm tính năng mới
- Tái sử dụng code

### 2. Cấu Hình
- Environment variables
- Config files
- Feature flags

## Monitoring & Logging

### 1. Logging
- Request logging
- Error logging
- Performance metrics

### 2. Monitoring
- Health checks
- Performance monitoring
- Error tracking

## Quy Trình Phát Triển

### 1. Code Standards
- ESLint configuration
- Code formatting
- Documentation

### 2. Testing
- Unit tests
- Integration tests
- API tests

### 3. Deployment
- Development environment
- Staging environment
- Production environment