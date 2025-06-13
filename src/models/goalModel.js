// goalModel.js
// Model for goal-related database operations

const db = require('../services/db');

const GoalModel = {
  // Tạo mục tiêu mới
  createGoal: async (goalData) => {
    try {
      const query = 'INSERT INTO goals (name, description, deadline, priority, user_id, progress, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const params = [goalData.name, goalData.description, goalData.deadline, goalData.priority, goalData.userId, 0, 'Not Started'];
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw new Error('Không thể tạo mục tiêu');
    }
  },

  // Lấy danh sách mục tiêu
  getGoals: async (filters) => {
    try {
      const query = `SELECT * FROM goals WHERE user_id = ? AND status LIKE ? AND priority LIKE ? ORDER BY deadline DESC`;
      const params = [filters.userId, `%${filters.status}%`, `%${filters.priority}%`];
      const results = await db.query(query, params);
      return results;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw new Error('Không thể lấy danh sách mục tiêu');
    }
  },

  // Cập nhật mục tiêu
  updateGoal: async (goalId, updateData) => {
    try {
      const query = 'UPDATE goals SET name = ?, description = ?, deadline = ?, priority = ?, status = ? WHERE id = ? AND user_id = ?';
      const params = [updateData.name, updateData.description, updateData.deadline, updateData.priority, updateData.status, goalId, updateData.userId];
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error('Không thể cập nhật mục tiêu');
    }
  },

  // Cập nhật tiến độ mục tiêu
  updateProgress: async (goalId, progressData) => {
    try {
      const query = 'UPDATE goals SET progress = ?, status = ? WHERE id = ?';
      const params = [progressData.progress, progressData.status, goalId];
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw new Error('Không thể cập nhật tiến độ mục tiêu');
    }
  },

  // Lấy mục tiêu theo ID
  getGoalById: async (goalId) => {
    try {
      const query = 'SELECT * FROM goals WHERE id = ?';
      const results = await db.query(query, [goalId]);
      if (results.length === 0) {
        throw new Error('Mục tiêu không tồn tại');
      }
      return results[0];
    } catch (error) {
      console.error('Error fetching goal by ID:', error);
      throw new Error('Không thể lấy thông tin mục tiêu');
    }
  },

  // Xóa mục tiêu
  deleteGoal: async (goalId) => {
    try {
      const query = 'DELETE FROM goals WHERE id = ?';
      const result = await db.query(query, [goalId]);
      return result;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw new Error('Không thể xóa mục tiêu');
    }
  },

  // Tạo nhóm mục tiêu
  createGoalGroup: async (groupData) => {
    try {
      const query = 'INSERT INTO goal_groups (name, description, user_id) VALUES (?, ?, ?)';
      const params = [groupData.name, groupData.description, groupData.userId];
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error('Error creating goal group:', error);
      throw new Error('Không thể tạo nhóm mục tiêu');
    }
  },

  // Thống kê tiến độ mục tiêu
  getGoalStats: async (userId) => {
    try {
      const query = `
        SELECT 
          COUNT(*) AS totalGoals,
          SUM(status = 'Completed') AS completedGoals,
          SUM(status = 'In Progress') AS inProgressGoals,
          SUM(status = 'Not Started') AS notStartedGoals
        FROM goals
        WHERE user_id = ?
      `;
      const result = await db.query(query, [userId]);
      return result;
    } catch (error) {
      console.error('Error fetching goal stats:', error);
      throw new Error('Không thể lấy thống kê mục tiêu');
    }
  }
};

module.exports = GoalModel;
