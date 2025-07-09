# Goal Phases API Documentation

Tài liệu hướng dẫn sử dụng các API liên quan đến quản lý giai đoạn mục tiêu (Goal Phases) trong PlantCraft Backend.

## Tổng quan

Goal Phases API cho phép người dùng:
- Tạo và quản lý các giai đoạn của mục tiêu
- Tổ chức nhiệm vụ theo từng giai đoạn
- Theo dõi tiến độ chi tiết của từng giai đoạn
- Tạo roadmap và timeline cho mục tiêu

## Authentication

Tất cả các API endpoints đều yêu cầu xác thực JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Quản lý Giai đoạn (Phase Management)

#### Tạo giai đoạn mới
```http
POST /api/goals/:goalId/phases
```

**Request Body:**
```json
{
  "title": "Giai đoạn 1: Học cơ bản",
  "description": "Học các khái niệm cơ bản về Node.js",
  "order_number": 1
}
```

**Response:**
```json
{
  "message": "Tạo giai đoạn mục tiêu thành công",
  "phase": {
    "id": 1,
    "goal_id": 1,
    "title": "Giai đoạn 1: Học cơ bản",
    "description": "Học các khái niệm cơ bản về Node.js",
    "order_number": 1,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

#### Lấy danh sách giai đoạn
```http
GET /api/goals/:goalId/phases
```

**Response:**
```json
{
  "goal": {
    "id": 1,
    "name": "Học lập trình Node.js"
  },
  "phases": [
    {
      "id": 1,
      "title": "Giai đoạn 1: Học cơ bản",
      "description": "Học các khái niệm cơ bản về Node.js",
      "order_number": 1,
      "progress": 75,
      "total_tasks": 4,
      "completed_tasks": 3,
      "status": "in_progress"
    }
  ]
}
```

#### Lấy chi tiết giai đoạn
```http
GET /api/goals/:goalId/phases/:phaseId
```

**Response:**
```json
{
  "phase": {
    "id": 1,
    "title": "Giai đoạn 1: Học cơ bản",
    "description": "Học các khái niệm cơ bản về Node.js",
    "order_number": 1,
    "progress": 75,
    "total_tasks": 4,
    "completed_tasks": 3,
    "status": "in_progress",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "tasks": [
    {
      "id": 1,
      "title": "Học về Express.js",
      "status": "completed",
      "priority": "high",
      "deadline": "2024-01-20T23:59:59Z"
    }
  ]
}
```

#### Cập nhật giai đoạn
```http
PUT /api/goals/:goalId/phases/:phaseId
```

**Request Body:**
```json
{
  "title": "Giai đoạn 1: Học cơ bản Node.js",
  "description": "Học các khái niệm cơ bản về Node.js và Express",
  "order_number": 1
}
```

#### Xóa giai đoạn
```http
DELETE /api/goals/:goalId/phases/:phaseId
```

**Response:**
```json
{
  "message": "Xóa giai đoạn thành công"
}
```

#### Sắp xếp lại thứ tự giai đoạn
```http
PUT /api/goals/:goalId/phases/reorder
```

**Request Body:**
```json
{
  "phase_orders": [
    {"phase_id": 2, "order_number": 1},
    {"phase_id": 1, "order_number": 2},
    {"phase_id": 3, "order_number": 3}
  ]
}
```

### 2. Quản lý Nhiệm vụ trong Giai đoạn (Task Management)

#### Tạo nhiệm vụ trong giai đoạn
```http
POST /api/goals/:goalId/phases/:phaseId/tasks
```

**Request Body:**
```json
{
  "title": "Học về Express.js",
  "description": "Tìm hiểu về framework Express.js",
  "deadline": "2024-01-20T23:59:59Z",
  "priority": "high"
}
```

#### Lấy danh sách nhiệm vụ trong giai đoạn
```http
GET /api/goals/:goalId/phases/:phaseId/tasks
```

**Query Parameters:**
- `status`: Lọc theo trạng thái (pending, in_progress, completed, cancelled)
- `priority`: Lọc theo độ ưu tiên (low, medium, high)
- `sort_by`: Sắp xếp theo (priority, deadline, created_at)

#### Cập nhật trạng thái nhiệm vụ
```http
PUT /api/goals/:goalId/phases/:phaseId/tasks/:taskId/status
```

**Request Body:**
```json
{
  "status": "completed"
}
```

#### Di chuyển nhiệm vụ giữa các giai đoạn
```http
PUT /api/goals/:goalId/phases/:phaseId/tasks/:taskId/move
```

**Request Body:**
```json
{
  "target_phase_id": 2
}
```

### 3. Thống kê và Tiến độ (Statistics & Progress)

#### Thống kê giai đoạn
```http
GET /api/goals/:goalId/phases/:phaseId/stats
```

**Response:**
```json
{
  "phase": {
    "id": 1,
    "title": "Giai đoạn 1: Học cơ bản"
  },
  "statistics": {
    "total_tasks": 4,
    "completed_tasks": 3,
    "in_progress_tasks": 1,
    "pending_tasks": 0,
    "overdue_tasks": 0,
    "completion_rate": 75,
    "average_completion_time": 120,
    "estimated_remaining_time": 60
  },
  "timeline": [
    {
      "date": "2024-01-10",
      "completed_tasks": 1
    }
  ],
  "priority_distribution": {
    "high": 2,
    "medium": 1,
    "low": 1
  }
}
```

#### Thống kê nhiệm vụ trong giai đoạn
```http
GET /api/goals/:goalId/phases/:phaseId/tasks/stats
```

**Query Parameters:**
- `start_date`: Ngày bắt đầu thống kê
- `end_date`: Ngày kết thúc thống kê

#### Cập nhật tiến độ giai đoạn tự động
```http
PUT /api/goals/:goalId/phases/:phaseId/auto-progress
```

### 4. Progress Tracking với Phases

#### Xem tiến độ mục tiêu với giai đoạn
```http
GET /api/goals/:goalId/progress-with-phases
```

**Response:**
```json
{
  "goal": {
    "id": 1,
    "name": "Học lập trình Node.js",
    "description": "Học lập trình Node.js trong 3 tháng",
    "deadline": "2024-03-31",
    "priority": "high",
    "status": "in_progress",
    "overall_progress": 45
  },
  "phases": [
    {
      "id": 1,
      "title": "Giai đoạn 1: Học cơ bản",
      "order_number": 1,
      "progress": 75,
      "total_tasks": 4,
      "completed_tasks": 3,
      "status": "in_progress"
    }
  ],
  "analysis": {
    "estimated_completion_date": "2024-03-15",
    "on_track": true,
    "next_milestone": "Hoàn thành Giai đoạn 2",
    "suggestions": [
      "Tăng tốc độ hoàn thành Giai đoạn 2",
      "Chuẩn bị sớm cho Giai đoạn 3"
    ]
  }
}
```

#### Lấy roadmap chi tiết
```http
GET /api/goals/:goalId/roadmap
```

**Response:**
```json
{
  "goal": {
    "id": 1,
    "name": "Học lập trình Node.js",
    "deadline": "2024-03-31"
  },
  "roadmap": [
    {
      "phase": {
        "id": 1,
        "title": "Giai đoạn 1: Học cơ bản",
        "order_number": 1,
        "progress": 75
      },
      "tasks": [
        {
          "id": 1,
          "title": "Học về Node.js cơ bản",
          "status": "completed",
          "deadline": "2024-01-10"
        }
      ],
      "milestone": "Hoàn thành kiến thức cơ bản"
    }
  ],
  "timeline": {
    "start_date": "2024-01-01",
    "end_date": "2024-03-31",
    "total_duration": "90 days",
    "remaining_duration": "45 days"
  }
}
```

## Error Responses

### Lỗi xác thực (401)
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### Lỗi không tìm thấy (404)
```json
{
  "message": "Không tìm thấy mục tiêu hoặc không có quyền truy cập"
}
```

### Lỗi dữ liệu (400)
```json
{
  "message": "Title không được để trống"
}
```

### Lỗi xung đột (409)
```json
{
  "message": "Thứ tự giai đoạn đã tồn tại"
}
```

## Testing

Để chạy test cho Goal Phases API:

```bash
npm run test:goal-phases
```

## Cài đặt và Chạy

1. Cài đặt dependencies:
```bash
npm install
```

2. Thiết lập database:
```bash
npm run setup-db
```

3. Chạy server:
```bash
npm run dev
```

## Lưu ý

- Tất cả các API đều yêu cầu xác thực JWT token
- Khi xóa giai đoạn, tất cả nhiệm vụ chưa hoàn thành sẽ bị xóa theo
- Tiến độ giai đoạn được tính tự động dựa trên số lượng nhiệm vụ đã hoàn thành
- Thứ tự giai đoạn được sắp xếp theo `order_number`
- Deadline của nhiệm vụ phải là định dạng ISO 8601 