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

    // Trả về mảng rỗng nếu không có mục tiêu hoàn thành
    return res.status(200).json(completedGoals);
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
// Thống kê tiến độ mục tiêu
const getGoalStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await GoalModel.getGoalStats(userId);

    // Trường hợp không lấy được dữ liệu
    if (!stats) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu thống kê.' });
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching goal stats:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê tiến độ mục tiêu.' });
  }
};


// Xem tiến độ mục tiêu với giai đoạn
const getProgressWithPhases = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    // Lấy thông tin goal
    const goal = await GoalModel.getGoalById(goalId);
    if (!goal || goal.user_id !== userId) {
      return res.status(404).json({
        message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
      });
    }

    // Lấy danh sách phases
    const GoalPhaseModel = require('../models/goalPhaseModel');
    const phases = await GoalPhaseModel.getPhasesByGoalId(goalId, userId);

    // Đảm bảo phases là một mảng
    const phasesArray = Array.isArray(phases) ? phases : [];

    // Tính toán tiến độ tổng thể
    const totalPhases = phasesArray.length;
    const completedPhases = phasesArray.filter(p => p.status === 'completed').length;
    const overallProgress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

    // Phân tích và dự đoán
    const analysis = {
      estimated_completion_date: null,
      on_track: true,
      next_milestone: null,
      suggestions: []
    };

    if (phasesArray.length > 0) {
      const nextPhase = phasesArray.find(p => p.status !== 'completed');
      if (nextPhase) {
        analysis.next_milestone = `Hoàn thành ${nextPhase.title}`;
      }

      // Tính toán dự đoán thời gian hoàn thành
      const remainingPhases = phasesArray.filter(p => p.status !== 'completed').length;
      if (remainingPhases > 0) {
        const avgDaysPerPhase = 7; // Giả sử trung bình 7 ngày/phase
        const estimatedDays = remainingPhases * avgDaysPerPhase;
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
        analysis.estimated_completion_date = estimatedDate.toISOString().split('T')[0];
      }

      // Đề xuất cải thiện
      if (overallProgress < 50) {
        analysis.suggestions.push('Tăng tốc độ hoàn thành để đạt deadline');
      }
      if (phasesArray.some(p => p.status === 'not_started')) {
        analysis.suggestions.push('Bắt đầu các giai đoạn chưa thực hiện');
      }
    }

    res.json({
      goal: {
        id: goal.id || null,
        name: goal.name || '',
        description: goal.description || '',
        deadline: goal.deadline || null,
        priority: goal.priority || '',
        status: goal.status || '',
        overall_progress: overallProgress
      },
      phases: phasesArray,
      analysis
    });
  } catch (error) {
    console.error('Error getting progress with phases:', error);
    res.status(500).json({
      message: 'Lỗi server khi lấy tiến độ mục tiêu'
    });
  }
};

// Lấy roadmap chi tiết của mục tiêu
const getGoalRoadmap = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    // Lấy thông tin goal
    const goal = await GoalModel.getGoalById(goalId);
    if (!goal || goal.user_id !== userId) {
      return res.status(404).json({
        message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
      });
    }

    // Lấy danh sách phases
    const GoalPhaseModel = require('../models/goalPhaseModel');
    const phases = await GoalPhaseModel.getPhasesByGoalId(goalId, userId);

    // Đảm bảo phases là một mảng
    const phasesArray = Array.isArray(phases) ? phases : [];

    // Lấy tasks cho từng phase
    const TaskModel = require('../models/taskModel');
    const roadmap = await Promise.all(
      phasesArray.map(async (phase) => {
        const tasks = await TaskModel.getTasksByPhaseId(phase.id);
        // Đảm bảo tasks luôn là mảng
        let tasksArray = [];
        if (Array.isArray(tasks)) {
          tasksArray = tasks;
        } else if (tasks && typeof tasks === 'object') {
          tasksArray = [tasks];
        } else {
          tasksArray = [];
        }
        console.log("this is task", tasksArray);
        return {
          phase: {
            id: phase.id || null,
            title: phase.title || '',
            order_number: phase.order_number || 0,
            progress: phase.progress || 0
          },
          tasks: tasksArray.map(task => ({
            id: task.id || null,
            title: task.title || '',
            status: task.status || '',
            deadline: task.deadline || null
          })),
          milestone: `Hoàn thành ${phase.title || 'Giai đoạn'}`
        };
      })
    );

    // Tính toán timeline
    const timeline = {
      start_date: (goal.created_at && typeof goal.created_at === 'string') ? goal.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      end_date: goal.deadline || null,
      total_duration: null,
      remaining_duration: null
    };

    if (timeline.start_date && timeline.end_date) {
      const start = new Date(timeline.start_date);
      const end = new Date(timeline.end_date);
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
      
      timeline.total_duration = `${totalDays} days`;
      timeline.remaining_duration = `${Math.max(0, remainingDays)} days`;
    }

    res.json({
      goal: {
        id: goal.id || null,
        name: goal.name || '',
        deadline: goal.deadline || null
      },
      roadmap,
      timeline
    });
  } catch (error) {
    console.error('Error getting goal roadmap:', error);
    res.status(500).json({
      message: 'Lỗi server khi lấy roadmap mục tiêu'
    });
  }
};

// 🎯 API Thống kê Goal Summary
const getGoalStatsSummary = async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    // Sample response for goal statistics
    const sampleResponse = {
      total: 8,
      completed: 5,
      inProgress: 3,
      completionRate: 62.5
    };

    res.json(sampleResponse);
  } catch (error) {
    console.error('Error getting goal statistics summary:', error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy thống kê mục tiêu",
      error: error.message 
    });
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
  updateGoalResult,
  getProgressWithPhases,
  getGoalRoadmap,
  getGoalStatsSummary
};
