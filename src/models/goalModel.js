// goalModel.js
// Model for goal-related database operations

const db = require('../services/db');

const GoalModel = {
  // Tạo mục tiêu mới
  createGoal: async (goalData) => {
    try {
      const query = 'INSERT INTO goals (name, description, deadline, priority, user_id, progress, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const params = [goalData.name, goalData.description, goalData.deadline, goalData.priority, goalData.userId, 0, goalData.status || 'not_started']; // Đảm bảo status hợp lệ và có giá trị mặc định
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw new Error('Không thể tạo mục tiêu');
    }
  },

  // Lấy danh sách mục tiêu với phân trang và tìm kiếm
  getGoals: async ({ search = "", status = "", priority = "", userId = null, limit = 10, offset = 0 }) => {
    try {
      // Kiểm tra giá trị limit và offset hợp lệ (cần là số nguyên và không âm)
      limit = parseInt(limit, 10);
      offset = parseInt(offset, 10);

      if (isNaN(limit) || limit <= 0) {
        throw new Error('Giới hạn (limit) không hợp lệ.');
      }
      if (isNaN(offset) || offset < 0) {
        throw new Error('Vị trí (offset) không hợp lệ.');
      }

      // Build the WHERE clause dynamically based on search parameters
      let whereClause = [];
      let params = [];

      if (search) {
        whereClause.push('name LIKE ?');
        params.push(`%${search}%`);
      }

      if (status) {
        whereClause.push('status LIKE ?');
        params.push(`%${status}%`);
      }

      if (priority) {
        whereClause.push('priority LIKE ?');
        params.push(`%${priority}%`);
      }

      if (userId) {
        whereClause.push('user_id = ?');
        params.push(userId);
      }

      // Construct the final query with LIMIT and OFFSET directly in the SQL string
      const query = `
        SELECT * FROM goals
        ${whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : ''}
        ORDER BY deadline DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Thực thi truy vấn với các tham số
      const results = await db.query(query, params);
      return results;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw new Error('Không thể lấy danh sách mục tiêu');
    }
  },

  // Lấy tổng số mục tiêu để tính phân trang
  getTotalGoals: async ({ search = "", status = "", priority = "", userId = null }) => {
    try {
      let whereClause = [];
      let params = [];

      if (search) {
        whereClause.push('name LIKE ?');
        params.push(`%${search}%`);
      }

      if (status) {
        whereClause.push('status LIKE ?');
        params.push(`%${status}%`);
      }

      if (priority) {
        whereClause.push('priority LIKE ?');
        params.push(`%${priority}%`);
      }

      if (userId) {
        whereClause.push('user_id = ?');
        params.push(userId);
      }

      const query = `
        SELECT COUNT(*) AS totalGoals FROM goals
        ${whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : ''};
      `;
      const result = await db.query(query, params);
      return result[0].totalGoals;
    } catch (error) {
      console.error('Error fetching total goals:', error);
      throw new Error('Không thể lấy tổng số mục tiêu');
    }
  },

  // Cập nhật mục tiêu
  updateGoal: async (goalId, updateData) => {
    try {
      // Validate required fields
      if (!updateData.name || !updateData.description || !updateData.deadline || !updateData.priority || !updateData.userId) {
        throw new Error('Thiếu thông tin cần thiết để cập nhật mục tiêu');
      }

      const query = 'UPDATE goals SET name = ?, description = ?, deadline = ?, priority = ? WHERE id = ? AND user_id = ?';
      const params = [
        updateData.name,
        updateData.description,
        updateData.deadline,
        updateData.priority,
        goalId,
        updateData.userId
      ];

      const result = await db.query(query, params);
      if (result.affectedRows === 0) {
        throw new Error('Không tìm thấy mục tiêu hoặc không có quyền cập nhật');
      }

      // Get the updated goal
      const updatedGoal = await GoalModel.getGoalById(goalId);
      return updatedGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error('Không thể cập nhật mục tiêu');
    }
  },

  // Cập nhật tiến độ mục tiêu
  updateProgress: async (goalId, updateData) => {
    try {
      const query = 'UPDATE goals SET progress = ?, status = ? WHERE id = ?';
      const params = [updateData.progress, updateData.status, goalId];
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
      if (!goalId) {
        throw new Error('ID mục tiêu không hợp lệ');
      }

      const query = 'SELECT * FROM goals WHERE id = ?';
      const results = await db.query(query, [goalId]);
      
      if (!results || results.length === 0) {
        console.log('Không tìm thấy mục tiêu với ID:', goalId);
        return null;
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
          SUM(status = 'completed') AS completedGoals,
          SUM(status = 'in_progress') AS inProgressGoals,
          SUM(status = 'not_started') AS notStartedGoals
        FROM goals
        WHERE user_id = ?
      `;
      const result = await db.query(query, [userId]);
      return result;
    } catch (error) {
      console.error('Error fetching goal stats:', error);
      throw new Error('Không thể lấy thống kê mục tiêu');
    }
  },

  // Cập nhật trạng thái mục tiêu
  updateGoalStatus: async (goalId, status) => {
    try {
      const query = 'UPDATE goals SET status = ? WHERE id = ?';
      const params = [status, goalId];
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error('Error updating goal status:', error);
      throw new Error('Không thể cập nhật trạng thái mục tiêu');
    }
  },

  // Lấy danh sách mục tiêu đã hoàn thành
  getCompletedGoals: async (userId) => {
    try {
      const query = `
        SELECT * FROM goals
        WHERE status = 'completed' AND user_id = ?
        ORDER BY deadline DESC;
      `;
      const params = [userId];

      const results = await db.query(query, params);
      return results;
    } catch (error) {
      console.error('Error fetching completed goals:', error);
      throw new Error('Không thể lấy mục tiêu hoàn thành');
    }
  },
};

module.exports = GoalModel;
