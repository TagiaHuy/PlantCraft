// goalController.js
// Quản lý mục tiêu cá nhân

const GoalModel = require('../models/goalModel');  // Import GoalModel
const { authenticateToken } = require('../middleware/auth');
const moment = require('moment');

// Tạo mục tiêu
const createGoal = async (req, res) => {
  try {
    const { name, description, deadline, priority, status = 'not_started' } = req.body;
    const userId = req.user.id;

    // Kiểm tra ngày hợp lệ với moment.js
    if (!moment(deadline, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ message: 'Ngày không hợp lệ.' });
    }

    // Kiểm tra xem status có hợp lệ không
    const validStatuses = ['not_started', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái mục tiêu không hợp lệ.' });
    }

    const result = await GoalModel.createGoal({ name, description, deadline, priority, userId, status });

    const newGoal = {
      id: result.insertId,
      name,
      description,
      deadline,
      priority,
      status,
      user_id: userId,
      created_at: new Date()
    };

    res.status(201).json({ goal: newGoal });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Lỗi khi tạo mục tiêu.' });
  }
};

// Lấy danh sách mục tiêu với phân trang và tìm kiếm
const getGoals = async (req, res) => {
  try {
    const { search = "", status = "", priority = "", page = 1, limit = 10 } = req.query;
    
    // Kiểm tra page và limit có hợp lệ không
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    
    if (isNaN(parsedPage) || parsedPage <= 0) {
      return res.status(400).json({ message: 'Số trang không hợp lệ.' });
    }
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ message: 'Giới hạn không hợp lệ.' });
    }

    const offset = (parsedPage - 1) * parsedLimit;

    const goals = await GoalModel.getGoals({
      search: search.toString(),
      status: status.toString(),
      priority: priority.toString(),
      userId: req.user.id,
      limit: parsedLimit,
      offset: offset
    });
    
    const totalGoals = await GoalModel.getTotalGoals({
      search: search.toString(),
      status: status.toString(),
      priority: priority.toString(),
      userId: req.user.id
    });

    res.status(200).json({
      goals,
      totalGoals,
      page: parsedPage,
      totalPages: Math.ceil(totalGoals / parsedLimit),
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách mục tiêu.' });
  }
};

// Lấy thông tin chi tiết mục tiêu
const getGoalById = async (req, res) => {
  try {
    const userId = req.user.id; // ID của người dùng đang đăng nhập
    const goalId = req.params.goalId; // Lấy goalId từ URL

    // Tìm mục tiêu theo ID
    const goal = await GoalModel.getGoalById(goalId);

    // Kiểm tra nếu không có mục tiêu hoặc mục tiêu không thuộc về người dùng
    if (!goal || goal.user_id !== userId) {
      return res.status(404).json({ message: 'Không tìm thấy mục tiêu.' });
    }

    // Trả về mục tiêu
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
    if (!goal || goal.user_id !== userId) {
      return res.status(404).json({ message: 'Không tìm thấy mục tiêu.' });
    }

    const updatedGoal = await GoalModel.updateGoal(goalId, { 
      name, 
      description, 
      deadline, 
      priority,
      userId 
    });

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

    // Kiểm tra xem tiến độ có được cung cấp không
    if (progress === undefined || progress === null) {
      return res.status(400).json({ message: 'Tiến độ không được để trống.' });
    }

    // Chuyển tiến độ thành số và kiểm tra tính hợp lệ
    const progressNum = Number(progress);

    if (isNaN(progressNum)) {
      return res.status(400).json({ message: 'Tiến độ phải là một số hợp lệ.' });
    }

    if (progressNum < 0 || progressNum > 100) {
      return res.status(422).json({ message: 'Tiến độ phải nằm trong khoảng từ 0 đến 100%' });
    }

    // Lấy thông tin mục tiêu từ database
    const goal = await GoalModel.getGoalById(goalId);

    // Kiểm tra quyền truy cập của người dùng
    if (!goal || goal.user_id !== userId) {
      return res.status(404).json({ message: 'Không tìm thấy mục tiêu hoặc không có quyền cập nhật.' });
    }

    // Xác định trạng thái dựa trên tiến độ
    const status = progressNum === 100 ? 'completed' : 'in_progress';

    // Cập nhật tiến độ và trạng thái mục tiêu
    await GoalModel.updateProgress(goalId, { 
      progress: progressNum,
      status,
      userId 
    });

    // Trả về kết quả sau khi cập nhật
    res.status(200).json({
      success: true,
      message: 'Cập nhật tiến độ mục tiêu thành công.',
      data: {
        progress: progressNum,
        status
      }
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi cập nhật tiến độ mục tiêu.'
    });
  }
};


// Cập nhật kết quả mục tiêu
const updateGoalResult = async (req, res) => {
  try {
    const userId = req.user.id; // ID người dùng hiện tại
    const goalId = req.params.goalId; // goalId từ URL
    const { result } = req.body; // Kết quả mục tiêu (ví dụ: "Completed")

    // Kiểm tra nếu result hợp lệ (ví dụ: 'completed' hoặc 'cancelled')
    const validResults = ['completed', 'cancelled'];
    if (!validResults.includes(result)) {
      return res.status(400).json({ message: 'Kết quả mục tiêu không hợp lệ.' });
    }

    // Lấy mục tiêu từ CSDL
    const goal = await GoalModel.getGoalById(goalId);
    if (goal.user_id !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật mục tiêu này.' });
    }

    // Cập nhật kết quả mục tiêu
    await GoalModel.updateGoalStatus(goalId, result);

    // Trả về kết quả và thông báo thành công
    res.status(200).json({
      message: 'Đánh giá kết quả mục tiêu thành công.',
      goal: {
        id: goalId,
        result: result
      }
    });
  } catch (error) {
    console.error('Error updating goal result:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật kết quả mục tiêu.' });
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
    const userId = req.user.id;  // ID người dùng hiện tại
    
    // Gọi hàm model để lấy các mục tiêu hoàn thành của người dùng
    const completedGoals = await GoalModel.getCompletedGoals(userId);

    // Kiểm tra nếu không có mục tiêu hoàn thành nào
    if (completedGoals.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy mục tiêu hoàn thành.' });
    }

    // Trả về các mục tiêu hoàn thành
    res.status(200).json(completedGoals);
  } catch (error) {
    console.error('Error fetching completed goals:', error);
    res.status(500).json({ message: 'Lỗi khi lấy mục tiêu hoàn thành.' });
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
  getGoalStats,
  updateGoalResult
};
