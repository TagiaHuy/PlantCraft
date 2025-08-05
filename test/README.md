# API Testing Guide

## Chạy Test

### Test Authentication API
```bash
npm run test:auth
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

#### Login Tests
1. **Successful login with admin account**
   - Email: `admin@example.com`
   - Password: `123`
   - Expected: 200 OK với token và user info

2. **Failed login with wrong password**
   - Email: `admin@example.com`
   - Password: `wrongpassword`
   - Expected: 401 Unauthorized

3. **Failed login with non-existent email**
   - Email: `nonexistent@example.com`
   - Password: `123`
   - Expected: 401 Unauthorized

4. **Failed login with missing fields**
   - Missing email hoặc password
   - Expected: 400 Bad Request

#### Logout Tests
1. **Successful logout with valid token**
   - Uses token from successful login
   - Expected: 200 OK

2. **Failed logout without token**
   - No Authorization header
   - Expected: 400 Bad Request

3. **Failed logout with invalid token**
   - Invalid token in Authorization header
   - Expected: 400 Bad Request

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