const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/index');

describe('Goals API Tests', () => {
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

  describe('GET /api/goals', () => {
    it('should get all goals successfully', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.be.an('array');
    });
  });

  describe('POST /api/goals', () => {
    it('should create a new goal successfully', async () => {
      const goalData = {
        name: 'Test Goal',
        description: 'Test goal description',
        deadline: '2024-12-31',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData)
        .expect(200);

      expect(response.body).to.have.property('goal');
      expect(response.body.goal).to.have.property('id');
      expect(response.body.goal.name).to.equal('Test Goal');
    });
  });

  describe('GET /api/goals/:id', () => {
    it('should get goal by id successfully', async () => {
      // Tạo goal trước
      const createResponse = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Goal for Get',
          description: 'Test goal description',
          deadline: '2024-12-31',
          priority: 'medium'
        });

      const goalId = createResponse.body.goal.id;

      const response = await request(app)
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.have.property('goal');
      expect(response.body.goal.id).to.equal(goalId);
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('should update goal successfully', async () => {
      // Tạo goal trước
      const createResponse = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Goal for Update',
          description: 'Test goal description',
          deadline: '2024-12-31',
          priority: 'low'
        });

      const goalId = createResponse.body.goal.id;

      const updateData = {
        name: 'Updated Test Goal',
        description: 'Updated description',
        deadline: '2024-11-30',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body).to.have.property('goal');
      expect(response.body.goal.name).to.equal('Updated Test Goal');
    });
  });

  describe('GET /api/goals/stats', () => {
    it('should get goals statistics successfully', async () => {
      const response = await request(app)
        .get('/api/goals/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.have.property('totalGoals');
      expect(response.body).to.have.property('completedGoals');
      expect(response.body).to.have.property('inProgressGoals');
      expect(response.body).to.have.property('notStartedGoals');
    });
  });
}); 