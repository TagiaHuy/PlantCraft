const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/index');

describe('User API Tests', () => {
  let authToken;

  before(async () => {
    // Login để lấy token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: '123'
      });

    authToken = loginResponse.body.token;
  });

  describe('GET /api/user/profile', () => {
    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('id');
      expect(response.body.user).to.have.property('name');
      expect(response.body.user).to.have.property('email');
      expect(response.body.user.id).to.equal(12345);
      expect(response.body.user.email).to.equal('admin@example.com');
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Admin Name'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body).to.have.property('user');
      expect(response.body.user.name).to.equal('Updated Admin Name');
    });
  });
}); 