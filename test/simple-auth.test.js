const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/index');

describe('Simple Auth API Tests', () => {
  describe('POST /api/auth/login', () => {
    it('should login successfully with admin default account', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // Kiểm tra response structure
      expect(response.body).to.have.property('message');
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('user');

      // Kiểm tra message
      expect(response.body.message).to.equal('Đăng nhập thành công (admin)');

      // Kiểm tra user object
      expect(response.body.user).to.have.property('id');
      expect(response.body.user).to.have.property('name');
      expect(response.body.user).to.have.property('email');

      // Kiểm tra user data
      expect(response.body.user.id).to.equal(12345);
      expect(response.body.user.email).to.equal('admin@example.com');

      // Kiểm tra token
      expect(response.body.token).to.be.a('string');
      expect(response.body.token.length).to.be.greaterThan(0);
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;

    before(async () => {
      // Login first to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: '123'
        });

      authToken = loginResponse.body.token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('Đăng xuất thành công.');
    });
  });
}); 