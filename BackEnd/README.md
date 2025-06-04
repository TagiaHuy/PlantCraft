# PlantCraft Backend

Backend API cho ứng dụng PlantCraft - Nền tảng quản lý công việc và dự án cá nhân. 

## Cấu trúc dự án

```
src/
├── controllers/     # Xử lý logic nghiệp vụ
├── middleware/      # Middleware xác thực và bảo mật
├── models/          # Tương tác với cơ sở dữ liệu
├── routes/          # Định nghĩa API endpoints
├── services/        # Các service như kết nối database
└── index.js         # Entry point
```

## Tính năng



### Quản lý người dùng (Quỳnh Trang)
- Đăng ký / Đăng nhập / Đăng xuất
- Cập nhật thông tin cá nhân (tên, avatar,...)
- Bảo mật tài khoản (reset mật khẩu, xác thực email)

### Mục tiêu cá nhân (Hải Bắc)
- Tạo mục tiêu mới: tên, mô tả, thời gian bắt đầu/kết thúc, độ ưu tiên
- Chỉnh sửa, xóa mục tiêu
- Danh sách mục tiêu (có trạng thái: đang làm, hoàn thành, hủy bỏ)

### Lộ trình mục tiêu (Quang Lâm)
- Tạo lộ trình gồm nhiều giai đoạn/phần
- Trong mỗi phần: thêm các nhiệm vụ nhỏ (task)

### Nhiệm vụ (Task)
- Tạo nhiệm vụ: tiêu đề, mô tả, deadline, trạng thái (chưa làm, đang làm, hoàn thành)
- Gắn nhiệm vụ vào mục tiêu
- Đánh dấu hoàn thành / sửa đổi / xóa

### Danh sách nhiệm vụ hàng ngày
- Hệ thống tự tổng hợp nhiệm vụ cần làm hôm nay từ các mục tiêu
- Giao diện kiểu "to-do list"
- Tùy chọn: hoãn, đánh dấu ưu tiên, gợi ý thời gian làm

### Theo dõi tiến độ
- Tính phần trăm hoàn thành theo mục tiêu
- Biểu đồ tiến độ (theo thời gian)
- Thống kê: số nhiệm vụ đã làm, còn lại, trễ hạn

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd plantcraft-backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env từ mẫu .env.example và cấu hình:
```bash
cp .env.example .env
```

4. Cấu hình các biến môi trường trong file .env:
- Thông tin database
- JWT secret
- Cấu hình email
- URL ứng dụng

5. Khởi động server:
```bash
npm run dev  # Chế độ development
# hoặc
npm start    # Chế độ production
```

## API Endpoints

### Plants API
- `GET /api/plants` - Lấy danh sách cây
- `GET /api/plants/:id` - Lấy chi tiết cây
- `POST /api/plants` - Thêm cây mới
- `PUT /api/plants/:id` - Cập nhật thông tin cây
- `DELETE /api/plants/:id` - Xóa cây

### User API
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/verify-email` - Xác thực email
- `POST /api/auth/request-reset` - Yêu cầu đặt lại mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `GET /api/user/profile` - Xem thông tin cá nhân
- `PUT /api/user/profile` - Cập nhật thông tin cá nhân

### Goals API
- `GET /api/goals` - Lấy danh sách mục tiêu
- `GET /api/goals/:id` - Xem chi tiết mục tiêu
- `POST /api/goals` - Tạo mục tiêu mới
- `PUT /api/goals/:id` - Cập nhật mục tiêu
- `DELETE /api/goals/:id` - Xóa mục tiêu
- `GET /api/goals/:id/progress` - Xem tiến độ mục tiêu

### Roadmap API
- `GET /api/goals/:id/roadmap` - Xem lộ trình của mục tiêu
- `POST /api/goals/:id/roadmap` - Tạo giai đoạn mới
- `PUT /api/goals/:id/roadmap/:phaseId` - Cập nhật giai đoạn
- `DELETE /api/goals/:id/roadmap/:phaseId` - Xóa giai đoạn

### Tasks API
- `GET /api/tasks` - Lấy danh sách nhiệm vụ
- `GET /api/tasks/today` - Lấy danh sách nhiệm vụ hôm nay
- `GET /api/tasks/:id` - Xem chi tiết nhiệm vụ
- `POST /api/tasks` - Tạo nhiệm vụ mới
- `PUT /api/tasks/:id` - Cập nhật nhiệm vụ
- `DELETE /api/tasks/:id` - Xóa nhiệm vụ
- `PUT /api/tasks/:id/status` - Cập nhật trạng thái nhiệm vụ
- `GET /api/tasks/statistics` - Xem thống kê nhiệm vụ

## Công nghệ sử dụng

- Node.js & Express.js
- MySQL (với mysql2)
- JWT cho xác thực
- Nodemailer cho gửi email
- Bcrypt cho mã hóa mật khẩu

## Bảo mật

- Mã hóa mật khẩu với bcrypt
- Xác thực với JWT
- Xác thực email
- Bảo vệ các route nhạy cảm
- Kiểm tra quyền truy cập

## Đóng góp

Mọi đóng góp đều được chào đón. Vui lòng tạo issue hoặc pull request để đóng góp.

## License

MIT