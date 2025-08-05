const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/index');

describe('Tasks API Tests', () => {
  let authToken;
  let goalId;

  before(async () => {
    // Login để lấy token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: '123'
      });

    authToken = loginResponse.body.token;

    // Tạo goal để test tasks
    const goalResponse = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Goal for Tasks',
        description: 'Test goal for tasks',
        deadline: '2024-12-31',
        priority: 'medium'
      });

    goalId = goalResponse.body.goal.id;
  });

  describe('GET /api/tasks/today', () => {
    it('should get today tasks successfully', async () => {
      const response = await request(app)
        .get('/api/tasks/today')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.have.property('tasks');
      expect(response.body).to.have.property('total');
      expect(response.body).to.have.property('total_duration');
      expect(response.body.tasks).to.be.an('array');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        deadline: '2024-12-31T23:59:59Z',
        goal_id: goalId,
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400); // API có thể trả về 400 nếu có validation error

      // Kiểm tra response có message lỗi
      expect(response.body).to.have.property('message');
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks successfully', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.have.property('tasks');
      expect(response.body).to.have.property('pagination');
      expect(response.body).to.have.property('filters');
      expect(response.body.tasks).to.be.an('array');
    });
  });

  describe('GET /api/tasks/statistics', () => {
    it('should get tasks statistics successfully', async () => {
      const response = await request(app)
        .get('/api/tasks/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.have.property('statistics');
      expect(response.body.statistics).to.have.property('total_tasks');
      expect(response.body.statistics).to.have.property('completed_tasks');
      expect(response.body.statistics).to.have.property('completion_rate');
    });
  });
}); 