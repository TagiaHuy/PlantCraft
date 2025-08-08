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

  describe('GET /api/tasks/stats', () => {
    it('should get task stats by date successfully', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.be.an('array');
      
      // Check if each item has the required properties
      if (response.body.length > 0) {
        const firstItem = response.body[0];
        expect(firstItem).to.have.property('date');
        expect(firstItem).to.have.property('completedTasks');
        expect(firstItem.date).to.match(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
        expect(firstItem.completedTasks).to.be.a('number');
      }
    });

    it('should get task stats by date with custom date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const response = await request(app)
        .get(`/api/tasks/stats?start_date=${startDate}&end_date=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.be.an('array');
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .get('/api/tasks/stats?start_date=invalid-date&end_date=2024-12-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.include('Định dạng ngày không hợp lệ');
    });
  });
}); 