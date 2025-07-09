const request = require('supertest');
const app = require('../src/index');
const db = require('../src/services/db');

describe('Goal Phase API Tests', () => {
  let authToken;
  let testGoalId;
  let testPhaseId;
  let testTaskId;

  before(async () => {
    // Tạo user test và lấy token

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'tagiahuy2605@gmail.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;

    // Tạo goal test
    const goalResponse = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Goal',
        description: 'Test goal description',
        deadline: '2024-12-31',
        priority: 'high'
      });

    testGoalId = goalResponse.body.goal.id;
  });

  after(async () => {
    // Cleanup test data
    if (testGoalId) {
      await request(app)
        .delete(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
  });

  describe('POST /api/goals/:goalId/phases', () => {
    it('should create a new phase', async () => {
      const response = await request(app)
        .post(`/api/goals/${testGoalId}/phases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Phase 1',
          description: 'Test phase description',
          order_number: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Tạo giai đoạn mục tiêu thành công');
      expect(response.body.phase).toHaveProperty('id');
      expect(response.body.phase.title).toBe('Test Phase 1');
      
      testPhaseId = response.body.phase.id;
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post(`/api/goals/${testGoalId}/phases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '',
          order_number: 0
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/goals/:goalId/phases', () => {
    it('should get phases for a goal', async () => {
      const response = await request(app)
        .get(`/api/goals/${testGoalId}/phases`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('goal');
      expect(response.body).toHaveProperty('phases');
      expect(Array.isArray(response.body.phases)).toBe(true);
    });
  });

  describe('GET /api/goals/:goalId/phases/:phaseId', () => {
    it('should get phase details', async () => {
      const response = await request(app)
        .get(`/api/goals/${testGoalId}/phases/${testPhaseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('phase');
      expect(response.body).toHaveProperty('tasks');
      expect(response.body.phase.id).toBe(testPhaseId);
    });
  });

  describe('PUT /api/goals/:goalId/phases/:phaseId', () => {
    it('should update phase', async () => {
      const response = await request(app)
        .put(`/api/goals/${testGoalId}/phases/${testPhaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Test Phase',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cập nhật giai đoạn thành công');
      expect(response.body.phase.title).toBe('Updated Test Phase');
    });
  });

  describe('POST /api/goals/:goalId/phases/:phaseId/tasks', () => {
    it('should create task in phase', async () => {
      const response = await request(app)
        .post(`/api/goals/${testGoalId}/phases/${testPhaseId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test task description',
          deadline: '2024-01-20T23:59:59Z',
          priority: 'high'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Tạo nhiệm vụ trong giai đoạn thành công');
      expect(response.body.task).toHaveProperty('id');
      
      testTaskId = response.body.task.id;
    });
  });

  describe('GET /api/goals/:goalId/phases/:phaseId/tasks', () => {
    it('should get tasks in phase', async () => {
      const response = await request(app)
        .get(`/api/goals/${testGoalId}/phases/${testPhaseId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('phase');
      expect(response.body).toHaveProperty('tasks');
      expect(Array.isArray(response.body.tasks)).toBe(true);
    });
  });

  describe('PUT /api/goals/:goalId/phases/:phaseId/tasks/:taskId/status', () => {
    it('should update task status', async () => {
      const response = await request(app)
        .put(`/api/goals/${testGoalId}/phases/${testPhaseId}/tasks/${testTaskId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cập nhật trạng thái thành công');
      expect(response.body.task.status).toBe('completed');
    });
  });

  describe('GET /api/goals/:goalId/phases/:phaseId/stats', () => {
    it('should get phase statistics', async () => {
      const response = await request(app)
        .get(`/api/goals/${testGoalId}/phases/${testPhaseId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('phase');
      expect(response.body).toHaveProperty('statistics');
      expect(response.body.statistics).toHaveProperty('total_tasks');
    });
  });

  describe('PUT /api/goals/:goalId/phases/:phaseId/auto-progress', () => {
    it('should update phase progress automatically', async () => {
      const response = await request(app)
        .put(`/api/goals/${testGoalId}/phases/${testPhaseId}/auto-progress`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cập nhật tiến độ giai đoạn thành công');
      expect(response.body).toHaveProperty('phase');
      expect(response.body).toHaveProperty('goal_progress');
    });
  });

  describe('GET /api/goals/:goalId/progress-with-phases', () => {
    it('should get goal progress with phases', async () => {
      const response = await request(app)
        .get(`/api/goals/${testGoalId}/progress-with-phases`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('goal');
      expect(response.body).toHaveProperty('phases');
      expect(response.body).toHaveProperty('analysis');
    });
  });

  describe('GET /api/goals/:goalId/roadmap', () => {
    it('should get goal roadmap', async () => {
      const response = await request(app)
        .get(`/api/goals/${testGoalId}/roadmap`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('goal');
      expect(response.body).toHaveProperty('roadmap');
      expect(response.body).toHaveProperty('timeline');
    });
  });

  describe('DELETE /api/goals/:goalId/phases/:phaseId', () => {
    it('should delete phase', async () => {
      // Tạo phase mới để xóa
      const createResponse = await request(app)
        .post(`/api/goals/${testGoalId}/phases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Phase to Delete',
          description: 'This phase will be deleted',
          order_number: 2
        });

      const phaseToDelete = createResponse.body.phase.id;

      const response = await request(app)
        .delete(`/api/goals/${testGoalId}/phases/${phaseToDelete}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Xóa giai đoạn thành công');
    });
  });
}); 