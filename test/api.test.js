const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/index');

// Dữ liệu test mẫu
const testUser = {
  name: 'Test User',
  email: `testuser_${Date.now()}@gmail.com`,
  password: 'password123'
};
let jwtToken = '';

// Đăng ký, đăng nhập, lấy token, test các API cần xác thực

describe('User API Integration', function() {
  this.timeout(10000); // Tăng timeout nếu cần

  it('should register a new user', (done) => {
    request(app)
      .post('/api/auth/register')
      .send({ name: testUser.name, email: testUser.email, password: testUser.password })
      .expect(201)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        done(err);
      });
  });

  it('should not register with existing email', (done) => {
    request(app)
      .post('/api/auth/register')
      .send({ name: testUser.name, email: testUser.email, password: testUser.password })
      .expect(400)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        done(err);
      });
  });

  it('should not login before email verification', (done) => {
    request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(401)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        done(err);
      });
  });

  it('should resend verification email', (done) => {
    request(app)
      .post('/api/auth/resend-verification')
      .send({ email: testUser.email })
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        done(err);
      });
  });

  // Các bước xác thực email thực tế cần lấy token xác thực từ email, ở đây chỉ test API trả về lỗi nếu token sai
  it('should fail to verify email with invalid token', (done) => {
    request(app)
      .get('/api/auth/verify-email?token=invalidtoken')
      .expect(400)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        done(err);
      });
  });

  it('should request password reset', (done) => {
    request(app)
      .post('/api/auth/request-reset')
      .send({ email: testUser.email })
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        done(err);
      }); 
  });

  it('should fail to reset password with invalid token', (done) => {
    request(app)
      .post('/api/auth/reset-password?token=invalidtoken')
      .send({ newPassword: 'NewPassword123!' })
      .expect(400)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        done(err);
      });
  });

  // Các test dưới đây cần tài khoản đã xác thực email và đăng nhập thành công để lấy token
  // Nếu muốn test thực tế, bạn cần xác thực email thủ công hoặc mock xác thực

  it('should fail to get profile without token', (done) => {
    request(app)
      .get('/api/user/profile')
      .expect(401)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        done(err);
      });
  });

  it('should fail to update profile without token', (done) => {
    request(app)
      .put('/api/user/profile')
      .send({ name: 'New Name' })
      .expect(401)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        done(err);
      });
  });

  it('should fail to logout without token', (done) => {
    request(app)
      .post('/api/auth/logout')
      .expect(401)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        done(err);
      });
  });

  // Nếu muốn test các API cần token, bạn cần xác thực email và đăng nhập để lấy token hợp lệ
  // Sau đó, bạn có thể thêm các test như sau:
  // it('should login and get token', (done) => { ... });
  // it('should get profile with token', (done) => { ... });
  // it('should update profile with token', (done) => { ... });
  // it('should logout with token', (done) => { ... });
});

describe('API General Tests', () => {
  it('should return 404 for a non-existent route', (done) => {
    request(app)
      .get('/this-is-a-route-that-should-not-exist')
      .end((err, res) => {
        expect(res.statusCode).to.equal(404);
        done();
      });
  });

//   it('should return a list of goals for GET /api/goals', (done) => {
//     request(app)
//       .get('/api/goals') // Đường dẫn API bạn muốn test
//       .expect(200) // Mong đợi status code 200 OK
//       .end((err, res) => {
//         if (err) return done(err);

//         // Dùng 'expect' của Chai để kiểm tra sâu hơn về dữ liệu trả về
//         expect(res.body).to.be.an('array'); // Ví dụ: mong đợi kết quả là một mảng

//         done(); // Báo hiệu test này đã hoàn thành
//       });
//   });
}); 