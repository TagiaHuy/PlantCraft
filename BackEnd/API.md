# PlantCraft API Documentation

Tài liệu mô tả chi tiết các API endpoints của PlantCraft Backend.

## Authentication

### Đăng ký tài khoản

```http
POST /api/auth/register
```

**Luồng xử lý:**
1. Kiểm tra định dạng và tính hợp lệ của email, mật khẩu
2. Kiểm tra email đã tồn tại trong hệ thống chưa
3. Mã hóa mật khẩu sử dụng bcrypt
4. Tạo mã xác thực email
5. Gửi email xác thực đến địa chỉ email đăng k
6. Lưu thông tin người dùng vào databaseý
7. Trả về thông tin người dùng và thông báo

**Request Body:**
```json
{
  "name": "Nguyen Van A",
  "email": "example@email.com",
  "password": "password123"
}
```

**Response Success: (200)**
```json
{
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
}
```

### Đăng nhập

```http
POST /api/auth/login
```

**Luồng xử lý:**
1. Kiểm tra email có tồn tại trong hệ thống
2. Kiểm tra tài khoản đã được xác thực email chưa
3. So sánh mật khẩu đã mã hóa
4. Tạo JWT token chứa thông tin người dùng
5. Lưu token vào bảng active_sessions
6. Trả về token và thông tin người dùng

**Request Body:**
```json
{
  "email": "example@email.com",
  "password": "password123"
}
```

**Response Success: (200)**
```json
{
  "message": "Đăng nhập thành công",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "example@email.com"
  }
}
```

### Đăng xuất

```http
POST /api/auth/logout
```

**Luồng xử lý:**
1. Xác thực JWT token từ header
2. Xóa token khỏi bảng active_sessions
3. Thêm token vào blacklist để tránh tái sử dụng
4. Trả về thông báo thành công

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response Success: (200)**
```json
{
  "message": "Đăng xuất thành công"
}
```

## User Management

### Xem thông tin cá nhân

```http
GET /api/user/profile
```

**Luồng xử lý:**
1. Xác thực JWT token từ header
2. Lấy user_id từ token đã giải mã
3. Truy vấn thông tin chi tiết người dùng từ database
4. Định dạng và trả về dữ liệu

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response Success: (200)**
```json
{
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "example@email.com",
    "avatar": "url_to_avatar",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Cập nhật thông tin cá nhân

```http
PUT /api/user/profile
```

**Luồng xử lý:**
1. Xác thực JWT token từ header
2. Kiểm tra và xử lý dữ liệu đầu vào
3. Nếu có avatar:
   - Kiểm tra định dạng và kích thước file
   - Upload ảnh lên cloud storage
   - Lưu URL ảnh vào database
4. Cập nhật thông tin người dùng trong database
5. Trả về thông tin đã cập nhật

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Nguyen Van A Updated",
  "avatar": "base64_image_string"
}
```

**Response Success: (200)**
```json
{
  "message": "Cập nhật thông tin thành công",
  "user": {
    "id": 1,
    "name": "Nguyen Van A Updated",
    "avatar": "new_avatar_url"
  }
}
```

## Goals Management

### Tạo mục tiêu mới

```http
POST /api/goals
```

**Luồng xử lý:**
1. Xác thực JWT token từ header
2. Kiểm tra tính hợp lệ của dữ liệu đầu vào:
   - Kiểm tra các trường bắt buộc
   - Validate định dạng ngày tháng
   - Kiểm tra start_date < end_date
   - Validate priority trong danh sách cho phép
3. Tạo mục tiêu mới trong database với status mặc định là "in_progress"
4. Tạo các phase mặc định cho mục tiêu (nếu có)
5. Trả về thông tin mục tiêu đã tạo

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "title": "Học lập trình mobile",
  "description": "Hoàn thành khóa học React Native",
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "priority": "high"
}
```

**Response Success: (201)**
```json
{
  "message": "Tạo mục tiêu thành công",
  "goal": {
    "id": 1,
    "title": "Học lập trình mobile",
    "description": "Hoàn thành khóa học React Native",
    "start_date": "2024-01-01",
    "end_date": "2024-06-30",
    "priority": "high",
    "status": "in_progress"
  }
}
```

### Xem danh sách mục tiêu

```http
GET /api/goals
```

**Luồng xử lý:**
1. Xác thực JWT token từ header
2. Xử lý các tham số lọc và phân trang:
   - Validate các giá trị status và priority
   - Xử lý page size và page number
3. Truy vấn database với các điều kiện lọc
4. Tính toán tiến độ cho mỗi mục tiêu:
   - Lấy số lượng tasks đã hoàn thành
   - Tính phần trăm hoàn thành
5. Định dạng và trả về kết quả

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `status`: Lọc theo trạng thái (in_progress, completed, cancelled)
- `priority`: Lọc theo độ ưu tiên (high, medium, low)
- `page`: Số trang (mặc định: 1)
- `limit`: Số mục tiêu mỗi trang (mặc định: 10)

**Response Success: (200)**
```json
{
  "goals": [
    {
      "id": 1,
      "title": "Học lập trình mobile",
      "description": "Hoàn thành khóa học React Native",
      "start_date": "2024-01-01",
      "end_date": "2024-06-30",
      "priority": "high",
      "status": "in_progress",
      "progress": 45
    }
  ],
  "total": 1,
  "page": 1,
  "total_pages": 1
}
```

## Tasks Management

### Tạo nhiệm vụ mới

```http
POST /api/tasks
```

**Luồng xử lý:**
1. Xác thực JWT token từ header
2. Kiểm tra tính hợp lệ của dữ liệu:
   - Validate các trường bắt buộc
   - Kiểm tra định dạng deadline
   - Validate priority
   - Kiểm tra goal_id tồn tại và thuộc về user
3. Tính toán thời gian dự kiến hoàn thành dựa trên:
   - Độ phức tạp của nhiệm vụ
   - Priority level
   - Thời gian còn lại đến deadline
4. Tạo nhiệm vụ mới trong database
5. Cập nhật số lượng tasks của goal tương ứng
6. Trả về thông tin nhiệm vụ đã tạo

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "title": "Hoàn thành bài tập về State Management",
  "description": "Làm các bài tập về Redux",
  "deadline": "2024-01-15T23:59:59Z",
  "goal_id": 1,
  "priority": "high"
}
```

**Response Success: (201)**
```json
{
  "message": "Tạo nhiệm vụ thành công",
  "task": {
    "id": 1,
    "title": "Hoàn thành bài tập về State Management",
    "description": "Làm các bài tập về Redux",
    "deadline": "2024-01-15T23:59:59Z",
    "goal_id": 1,
    "priority": "high",
    "status": "pending",
    "estimated_duration": 120
  }
}
```

### Xem danh sách nhiệm vụ hôm nay

```http
GET /api/tasks/today
```

**Luồng xử lý:**
1. Xác thực JWT token từ header
2. Xác định múi giờ của người dùng
3. Lấy danh sách nhiệm vụ theo điều kiện:
   - Nhiệm vụ chưa hoàn thành
   - Deadline trong ngày hôm nay
   - Nhiệm vụ được lên kế hoạch cho hôm nay
4. Sắp xếp nhiệm vụ theo:
   - Priority level
   - Thời gian còn lại đến deadline
   - Estimated duration
5. Tính toán suggested_duration cho mỗi task
6. Trả về danh sách đã sắp xếp

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response Success: (200)**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Hoàn thành bài tập về State Management",
      "description": "Làm các bài tập về Redux",
      "deadline": "2024-01-15T23:59:59Z",
      "goal": {
        "id": 1,
        "title": "Học lập trình mobile"
      },
      "priority": "high",
      "status": "pending",
      "suggested_duration": 120,
      "remaining_time": "2h 30m"
    }
  ],
  "total": 1,
  "total_duration": 120
}
```

### Cập nhật trạng thái nhiệm vụ

```http
PUT /api/tasks/:id/status
```

**Luồng xử lý:**
1. Xác thực JWT token từ header
2. Kiểm tra task tồn tại và thuộc về user
3. Validate status mới hợp lệ
4. Cập nhật trạng thái task:
   - Cập nhật status
   - Ghi nhận thời điểm hoàn thành (nếu status = completed)
   - Tính toán thời gian thực tế hoàn thành
5. Cập nhật tiến độ của goal liên quan:
   - Tính lại số lượng tasks đã hoàn thành
   - Cập nhật phần trăm hoàn thành của goal
6. Gửi thông báo nếu goal đã hoàn thành
7. Trả về thông tin đã cập nhật

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response Success: (200)**
```json
{
  "message": "Cập nhật trạng thái thành công",
  "task": {
    "id": 1,
    "status": "completed",
    "completed_at": "2024-01-15T10:30:00Z",
    "actual_duration": 90,
    "goal_progress": 65
  }
}
```

## Progress Tracking

### Xem tiến độ mục tiêu

```http
GET /api/goals/:id/progress
```

**Luồng xử lý:**
1. Xác thực JWT token từ header
2. Kiểm tra goal tồn tại và thuộc về user
3. Tính toán các chỉ số tiến độ:
   - Tổng số tasks theo trạng thái
   - Phần trăm hoàn thành tổng thể
   - Tốc độ hoàn thành trung bình
   - Dự đoán thời gian hoàn thành
4. Phân tích timeline:
   - Lấy lịch sử cập nhật tiến độ
   - Tính toán tốc độ tiến triển
   - So sánh với kế hoạch ban đầu
5. Đề xuất điều chỉnh (nếu cần)
6. Trả về thông tin chi tiết

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response Success: (200)**
```json
{
  "goal": {
    "id": 1,
    "title": "Học lập trình mobile",
    "progress": 45,
    "tasks": {
      "total": 20,
      "completed": 9,
      "in_progress": 5,
      "pending": 6
    },
    "timeline": [
      {
        "date": "2024-01-01",
        "progress": 0
      },
      {
        "date": "2024-01-15",
        "progress": 45
      }
    ],
    "analysis": {
      "average_completion_rate": "3% per day",
      "estimated_completion_date": "2024-03-15",
      "status": "on_track",
      "suggestions": [
        "Tăng tốc độ hoàn thành để đạt deadline",
        "Tập trung vào các task ưu tiên cao"
      ]
    }
  }
}
```

### Xem thống kê nhiệm vụ

```http
GET /api/tasks/statistics
```

**Luồng xử lý:**
1. Xác thực JWT token từ header
2. Validate tham số đầu vào:
   - Kiểm tra định dạng ngày tháng
   - Đảm bảo start_date <= end_date
   - Giới hạn khoảng thời gian thống kê
3. Tính toán các chỉ số:
   - Tổng số nhiệm vụ trong khoảng thời gian
   - Số nhiệm vụ đã hoàn thành
   - Số nhiệm vụ quá hạn
   - Tỷ lệ hoàn thành
4. Phân tích xu hướng:
   - Thống kê theo ngày
   - Tính toán thời gian trung bình hoàn thành
   - Xác định thời điểm hiệu suất cao/thấp
5. Đề xuất cải thiện
6. Trả về kết quả thống kê

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `start_date`: Ngày bắt đầu thống kê
- `end_date`: Ngày kết thúc thống kê
- `group_by`: Nhóm theo (day, week, month)

**Response Success: (200)**
```json
{
  "statistics": {
    "total_tasks": 20,
    "completed_tasks": 15,
    "overdue_tasks": 2,
    "completion_rate": 75,
    "daily_completion": [
      {
        "date": "2024-01-14",
        "completed": 3,
        "total": 4,
        "average_completion_time": 95
      },
      {
        "date": "2024-01-15",
        "completed": 4,
        "total": 5,
        "average_completion_time": 85
      }
    ],
    "analysis": {
      "peak_performance_time": "Morning (9-11 AM)",
      "common_delays": ["Complex tasks", "Multiple dependencies"],
      "suggestions": [
        "Schedule complex tasks during peak performance hours",
        "Break down large tasks into smaller subtasks"
      ]
    }
  }
}
```

## Error Responses

### Lỗi xác thực (401)
```json
{
  "error": "Unauthorized",
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### Lỗi quyền truy cập (403)
```json
{
  "error": "Forbidden",
  "message": "Bạn không có quyền thực hiện hành động này"
}
```

### Lỗi không tìm thấy (404)
```json
{
  "error": "Not Found",
  "message": "Không tìm thấy tài nguyên yêu cầu"
}
```

### Lỗi dữ liệu (422)
```json
{
  "error": "Validation Error",
  "message": "Dữ liệu không hợp lệ",
  "details": {
    "email": "Email không đúng định dạng",
    "password": "Mật khẩu phải có ít nhất 8 ký tự"
  }
}
```