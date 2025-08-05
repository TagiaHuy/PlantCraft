# API Testing Guide

## Chạy Test

### Test Authentication API
```bash
npm run test:auth
```

### Test Goals API
```bash
npm run test:goals
```

### Test Tasks API
```bash
npm run test:tasks
```

### Test User API
```bash
npm run test:user
```

### Test Goal Phases API
```bash
npm run test:goal-phases
```

### Chạy tất cả test
```bash
npm test
```

## Test Cases

### Auth API Tests (`auth-api.test.js`)
- ✅ Login thành công với admin account
- ✅ Logout thành công với valid token

### Goals API Tests (`goals-api.test.js`)
- ✅ Lấy danh sách tất cả goals
- ✅ Tạo goal mới
- ✅ Lấy goal theo ID
- ✅ Cập nhật goal
- ✅ Lấy thống kê goals

### Tasks API Tests (`tasks-api.test.js`)
- ✅ Lấy tasks hôm nay
- ✅ Tạo task mới
- ✅ Lấy tất cả tasks
- ✅ Cập nhật trạng thái task
- ✅ Lấy thống kê tasks

### User API Tests (`user-api.test.js`)
- ✅ Lấy thông tin profile user
- ✅ Cập nhật profile user

## Requirements

- Server phải đang chạy
- Database phải được setup với admin account (id: 12345, email: admin@example.com, password: 123)
- Environment variables phải được cấu hình đúng

## Troubleshooting

### Lỗi thường gặp

1. **Connection refused**
   - Đảm bảo server đang chạy: `npm run dev`

2. **Database connection error**
   - Kiểm tra database connection: `npm run test-db`

3. **Admin account not found**
   - Chạy setup database: `npm run setup-db` 