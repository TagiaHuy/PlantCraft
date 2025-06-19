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
**Response Error: (401)**
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn"
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
    "avatar_url": "url_to_avatar_image",
    "is_email_verified": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
**Response Error: (401)**
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn."
}
```
**Response Error: (404)**
```json
{
  "message": "Không tìm thấy người dùng."
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
4. Cập nhật thông tin người dùng trong database, lưu lại lịch sử thay đổi thông tin cá nhân
5. Trả về thông tin đã cập nhật

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Nguyen Van A Updated",
  "avatarUrl": "base64_image_string_or_file_here"
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
**Response Error: (400)**
```json
{
  "message": "Định dạng ảnh không hợp lệ"
}
```

### Reset mật khẩu

```http
POST /api/auth/request-reset
```

**Luồng xử lý:**
1. Kiểm tra xem email có tồn tại trong hệ thống không.
2. Tạo và gửi một token reset mật khẩu qua email.
3. Trả về thông báo yêu cầu đặt lại mật khẩu.
**Request Body:**
```json
{
  "email": "example@email.com"
}
```

**Response Success: (200)**
```json
{
  "message": "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn."
}
```

### Đặt lại mật khẩu

```http
POST /api/auth/reset-password
```

**Luồng xử lý:**
1. Giải mã token và xác minh tính hợp lệ.
2. Cập nhật mật khẩu mới vào cơ sở dữ liệu.
3. Trả về thông báo thành công.
**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "new_password_here"
}
```
**Response Success: (200)**
```json
{
  "message": "Đặt lại mật khẩu thành công."
}
```

### Yêu cầu xác thực lại email

```http
POST /api/auth/resend-verification
```
**Luồng xử lý:**
1. Kiểm tra xem email đã đăng kí nhưng chưa xác thực
2. Gửi lại emial xác thực với mã mới
**Query Parameters:**
```json
{
  "email": "example@email.com"
}
```
**Response Success: (200)**
```json
{
  "message": "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư đến của bạn"
}
```

## Goals Management

### Tạo mục tiêu mới

```http
POST /api/goals
```

**Luồng xử lý:**
1. Xác thực JWT Token:
  - Lấy Authorization từ header của request.
  - Kiểm tra token có hợp lệ không. Nếu không, trả về lỗi 401 Unauthorized.

2. Kiểm tra và xử lý dữ liệu đầu vào:
  - Kiểm tra các trường name, description, deadline, priority có tồn tại và hợp lệ.
  - Đảm bảo rằng deadline là một ngày hợp lệ.

3. Lưu mục tiêu vào cơ sở dữ liệu:
  - Tạo mục tiêu mới trong cơ sở dữ liệu với các trường: name, description, deadline, priority, user_id (lấy từ token).

4. Trả về thông tin mục tiêu:
  - Trả về thông tin mục tiêu mới được tạo, bao gồm các trường dữ liệu đã nhập và created_at.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Học lập trình Node.js",
  "description": "Học lập trình Node.js trong 3 tháng.",
  "deadline": "2024-12-31",
  "priority": "High"
}
```

**Response Success: (200)**
```json
{
  "goal": {
    "id": 1,
    "name": "Học lập trình Node.js",
    "description": "Học lập trình Node.js trong 3 tháng.",
    "deadline": "2024-12-31",
    "priority": "High",
    "created_at": "2024-06-01"
  }
}
```

### Xem danh sách mục tiêu

```http
GET /api/goals
```

**Luồng xử lý:**
1. Xác thực JWT token từ header.
2. Truy vấn danh sách mục tiêu của người dùng từ cơ sở dữ liệu.
3. Trả về danh sách mục tiêu.

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
[
  {
    "id": 1,
    "name": "Học lập trình Node.js",
    "deadline": "2024-12-31",
    "priority": "High",
    "status": "In Progress"
  },
  {
    "id": 2,
    "name": "Giảm cân",
    "deadline": "2024-09-30",
    "priority": "Medium",
    "status": "Not Started"
  }
]
```

### Lấy thông tin chi tiết mục tiêu

```http
GET /api/goals/{goalId}
```

**Luồng xử lý:**
1. Xác thực JWT token từ header.
2. Truy vấn thông tin chi tiết mục tiêu từ cơ sở dữ liệu.
3. Trả về thông tin chi tiết mục tiêu.

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
  "goal": {
    "id": 1,
    "name": "Học lập trình Node.js",
    "description": "Học lập trình Node.js trong 3 tháng.",
    "deadline": "2024-12-31",
    "priority": "High",
    "status": "In Progress",
    "progress": "50%",
    "created_at": "2024-06-01"
  }
}
```

**Response Error: (404)**
```json
{
  "message": "Không tìm thấy mục tiêu."
}
```

### Cập nhật thông tin mục tiêu
```http
PUT /api/goals/{goalId}
```

**Luồng xử lý:**
1. Xác thực JWT token từ header.
2. Kiểm tra và xử lý dữ liệu đầu vào (name, description, deadline, priority).
3. Cập nhật thông tin mục tiêu trong cơ sở dữ liệu.
4. Trả về thông tin đã cập nhật.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**

```json
{
  "name": "Học lập trình Node.js nâng cao",
  "description": "Học Node.js nâng cao với các kỹ thuật tiên tiến.",
  "deadline": "2025-01-01",
  "priority": "High"
}
```
**Response Success: (200)**
```json
{
  "message": "Cập nhật thông tin mục tiêu thành công.",
  "goal": {
    "id": 1,
    "name": "Học lập trình Node.js nâng cao",
    "description": "Học Node.js nâng cao với các kỹ thuật tiên tiến.",
    "deadline": "2025-01-01",
    "priority": "High"
  }
}
```
**Response Error: (404)**
```json
{
  "message": "Không tìm thấy mục tiêu."
}
```

### Cập nhật tiến độ mục tiêu
```http
PUT /api/goals/{goalId}/progress
```

**Luồng xử lý:**
1. Xác thực JWT token từ header.
2. Kiểm tra quyền truy cập của người dùng đối với mục tiêu.
3. Cập nhật tiến độ mục tiêu trong cơ sở dữ liệu.
4. Trả về kết quả đánh giá mục tiêu đã cập nhật.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**

```json
{
  "progress": 70
}
```
**Response Success: (200)**
```json
{
  "message": "Cập nhật tiến độ mục tiêu thành công.",
  "goal": {
    "id": 1,
    "name": "Học lập trình Node.js",
    "progress": "70%"
  }
}
```

### Đánh giá kết quả mục tiêu
```http
PUT /api/goals/{goalId}/result
```

**Luồng xử lý:**
1. Xác thực JWT token từ header.
2. Kiểm tra quyền truy cập của người dùng đối với mục tiêu.
3. Cập nhật kết quả mục tiêu trong cơ sở dữ liệu (hoàn thành hoặc không hoàn thành).
4. Trả về tiến độ đã cập nhật.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**

```json
{
  "result": "Completed"
}
```
**Response Success: (200)**
```json
{
  "message": "Đánh giá kết quả mục tiêu thành công.",
  "goal": {
    "id": 1,
    "result": "Completed"
  }
}
```

### Xóa mục tiêu
```http
DELETE /api/goals/{goalId}
```

**Luồng xử lý:**
1. Xác thực JWT token từ header.
2. Kiểm tra quyền truy cập của người dùng đối với mục tiêu.
3. Xóa mục tiêu khỏi cơ sở dữ liệu.
4. Trả về thông báo thành công.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response Success: (200)**
```json
{
  "message": "Xóa mục tiêu thành công."
}
```

### Lấy danh sách mục tiêu đã hoàn thành
```http
GET /api/goals/completed
```

**Luồng xử lý:**
1. Xác thực JWT token từ header.
2. Truy vấn danh sách các mục tiêu đã hoàn thành từ cơ sở dữ liệu.
3. Trả về danh sách các mục tiêu đã hoàn thành.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response Success: (200)**
```json
[
  {
    "id": 1,
    "name": "Học lập trình Node.js",
    "status": "Completed"
  }
]
```

### Tạo nhóm mục tiêu
```http
POST /api/goals/groups
```

**Luồng xử lý:**
1. Xác thực JWT token từ header.
2. Kiểm tra và xử lý dữ liệu đầu vào (group name, description).
3. Tạo nhóm mục tiêu mới trong cơ sở dữ liệu.
4. Trả về thông tin nhóm mục tiêu mới.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**

```json
{
  "name": "Nhóm học Node.js",
  "description": "Nhóm học tập về Node.js cho các lập trình viên mới."
}
```
**Response Success: (200)**
```json
{
  "group": {
    "id": 1,
    "name": "Nhóm học Node.js",
    "description": "Nhóm học tập về Node.js cho các lập trình viên mới."
  }
}
```

### Thống kê tiến độ mục tiêu
```http
GET /api/goals/stats
```

**Luồng xử lý:**
1. Xác thực JWT token từ header.
2. Truy vấn tiến độ các mục tiêu từ cơ sở dữ liệu.
3. Trả về thống kê tiến độ các mục tiêu.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response Success: (200)**
```json
{
  "totalGoals": 10,
  "completedGoals": 5,
  "inProgressGoals": 3,
  "notStartedGoals": 2
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