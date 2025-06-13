// goalController.js
// Quản lý mục tiêu cá nhân

const db = require('../services/db');
const GoalModel = require('../models/goalModel');  // Import GoalModel
const { authenticateToken } = require('../middleware/auth');

// Tạo mục tiêu
const createGoal = async (req, res) => {
  try {
    const { name, description, deadline, priority } = req.body;
    const userId = req.user.id;  // Lấy userId từ token

    if (!name || !description || !deadline || !priority) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết.' });
    }

    const result = await GoalModel.createGoal({ name, description, deadline, priority, userId });

    const newGoal = {
      id: result.insertId,
      name,
      description,
      deadline,
      priority,
      user_id: userId,
      created_at: new Date()
    };

    res.status(201).json({ goal: newGoal });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Lỗi khi tạo mục tiêu.' });
  }
};

// Lấy danh sách mục tiêu
const getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await GoalModel.getGoals({ userId });

    res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách mục tiêu.' });
  }
};

// Lấy thông tin chi tiết mục tiêu
const getGoalById = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.goalId;

    const goal = await GoalModel.getGoalById(goalId);
    if (!goal || goal.user_id !== userId) {
      return res.status(404).json({ message: 'Không tìm thấy mục tiêu.' });
    }

    res.status(200).json({ goal });
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin mục tiêu.' });
  }
};

// Cập nhật thông tin mục tiêu
const updateGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.goalId;
    const { name, description, deadline, priority } = req.body;

    if (!name || !description || !deadline || !priority) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết.' });
    }

    const goal = await GoalModel.getGoalById(goalId);
    if (goal.user_id !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật mục tiêu này.' });
    }

    const updatedGoal = await GoalModel.updateGoal(goalId, { name, description, deadline, priority });
    res.status(200).json({
      message: 'Cập nhật mục tiêu thành công.',
      goal: updatedGoal,
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật mục tiêu.' });
  }
};

// Cập nhật tiến độ mục tiêu
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.goalId;
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(422).json({ message: 'Tiến độ phải nằm trong khoảng từ 0 đến 100%' });
    }

    const goal = await GoalModel.getGoalById(goalId);
    if (goal.user_id !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật tiến độ mục tiêu này.' });
    }

    await GoalModel.updateProgress(goalId, { progress });

    // Nếu tiến độ đã đạt 100%, cập nhật trạng thái của mục tiêu
    if (progress === 100) {
      await GoalModel.updateGoalStatus(goalId, 'Completed');
    }

    res.status(200).json({
      message: 'Cập nhật tiến độ mục tiêu thành công.',
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật tiến độ mục tiêu.' });
  }
};

// Xóa mục tiêu
const deleteGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.goalId;

    const goal = await GoalModel.getGoalById(goalId);
    if (goal.user_id !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa mục tiêu này.' });
    }

    await GoalModel.deleteGoal(goalId);
    res.status(200).json({ message: 'Xóa mục tiêu thành công.' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Lỗi khi xóa mục tiêu.' });
  }
};

// Lấy danh sách mục tiêu hoàn thành
const getCompletedGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const completedGoals = await GoalModel.getGoals({ userId, status: 'Completed' });

    res.status(200).json(completedGoals);
  } catch (error) {
    console.error('Error fetching completed goals:', error);
    res.status(500).json({ message: 'Lỗi khi lấy mục tiêu đã hoàn thành.' });
  }
};

// Tạo nhóm mục tiêu
const createGoalGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Thiếu thông tin nhóm mục tiêu.' });
    }

    const result = await GoalModel.createGoalGroup({ name, description, userId });
    res.status(201).json({
      message: 'Tạo nhóm mục tiêu thành công.',
      group: { id: result.insertId, name, description }
    });
  } catch (error) {
    console.error('Error creating goal group:', error);
    res.status(500).json({ message: 'Lỗi khi tạo nhóm mục tiêu.' });
  }
};

// Thống kê tiến độ mục tiêu
const getGoalStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await GoalModel.getGoalStats(userId);

    res.status(200).json(stats[0]);
  } catch (error) {
    console.error('Error fetching goal stats:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê tiến độ mục tiêu.' });
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  updateProgress,
  deleteGoal,
  getCompletedGoals,
  createGoalGroup,
  getGoalStats
};
