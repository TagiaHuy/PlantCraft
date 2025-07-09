const GoalPhaseModel = require('../models/goalPhaseModel');
const TaskModel = require('../models/taskModel');

class GoalPhaseController {
  // Tạo giai đoạn mục tiêu mới
  static async createPhase(req, res) {
    try {
      const { goalId } = req.params;
      const { title, description, order_number } = req.body;
      const userId = req.user.id;

      // Validate dữ liệu đầu vào
      if (!title || title.trim() === '') {
        return res.status(400).json({
          message: 'Title không được để trống'
        });
      }

      if (!order_number || order_number < 1) {
        return res.status(400).json({
          message: 'Order number phải là số nguyên dương'
        });
      }

      const phaseData = {
        title: title.trim(),
        description: description || '',
        order_number,
        user_id: userId
      };

      const phase = await GoalPhaseModel.createPhase(goalId, phaseData);

      res.status(201).json({
        message: 'Tạo giai đoạn mục tiêu thành công',
        phase
      });
    } catch (error) {
      console.error('Error creating phase:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Order number already exists for this goal') {
        return res.status(400).json({
          message: 'Thứ tự giai đoạn đã tồn tại'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi tạo giai đoạn mục tiêu'
      });
    }
  }

  // Lấy danh sách giai đoạn của mục tiêu
  static async getPhases(req, res) {
    try {
      const { goalId } = req.params;
      const userId = req.user.id;

      const phases = await GoalPhaseModel.getPhasesByGoalId(goalId, userId);

      // Lấy thông tin goal
      const goal = await require('../models/goalModel').getGoalById(goalId, userId);

      res.json({
        goal: {
          id: goal.id,
          name: goal.name
        },
        phases
      });
    } catch (error) {
      console.error('Error getting phases:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi lấy danh sách giai đoạn'
      });
    }
  }

  // Lấy thông tin chi tiết giai đoạn
  static async getPhaseById(req, res) {
    try {
      const { goalId, phaseId } = req.params;
      const userId = req.user.id;

      const result = await GoalPhaseModel.getPhaseById(goalId, phaseId, userId);

      res.json(result);
    } catch (error) {
      console.error('Error getting phase:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Phase not found') {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi lấy thông tin giai đoạn'
      });
    }
  }

  // Cập nhật thông tin giai đoạn
  static async updatePhase(req, res) {
    try {
      const { goalId, phaseId } = req.params;
      const { title, description, order_number } = req.body;
      const userId = req.user.id;

      // Validate dữ liệu đầu vào
      if (title !== undefined && title.trim() === '') {
        return res.status(400).json({
          message: 'Title không được để trống'
        });
      }

      if (order_number !== undefined && order_number < 1) {
        return res.status(400).json({
          message: 'Order number phải là số nguyên dương'
        });
      }

      const phaseData = {};
      if (title !== undefined) phaseData.title = title.trim();
      if (description !== undefined) phaseData.description = description;
      if (order_number !== undefined) phaseData.order_number = order_number;

      const updatedPhase = await GoalPhaseModel.updatePhase(goalId, phaseId, phaseData, userId);

      res.json({
        message: 'Cập nhật giai đoạn thành công',
        phase: updatedPhase
      });
    } catch (error) {
      console.error('Error updating phase:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Phase not found') {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      if (error.message === 'Order number already exists for this goal') {
        return res.status(400).json({
          message: 'Thứ tự giai đoạn đã tồn tại'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi cập nhật giai đoạn'
      });
    }
  }

  // Xóa giai đoạn mục tiêu
  static async deletePhase(req, res) {
    try {
      const { goalId, phaseId } = req.params;
      const userId = req.user.id;

      await GoalPhaseModel.deletePhase(goalId, phaseId, userId);

      res.json({
        message: 'Xóa giai đoạn thành công'
      });
    } catch (error) {
      console.error('Error deleting phase:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Phase not found') {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      if (error.message === 'Cannot delete phase with incomplete tasks') {
        return res.status(400).json({
          message: 'Không thể xóa giai đoạn có tasks chưa hoàn thành'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi xóa giai đoạn'
      });
    }
  }

  // Sắp xếp lại thứ tự giai đoạn
  static async reorderPhases(req, res) {
    try {
      const { goalId } = req.params;
      const { phase_orders } = req.body;
      const userId = req.user.id;

      // Validate dữ liệu đầu vào
      if (!Array.isArray(phase_orders) || phase_orders.length === 0) {
        return res.status(400).json({
          message: 'Danh sách thứ tự giai đoạn không hợp lệ'
        });
      }

      // Kiểm tra dữ liệu phase_orders
      for (const order of phase_orders) {
        if (!order.phase_id || !order.order_number || order.order_number < 1) {
          return res.status(400).json({
            message: 'Dữ liệu thứ tự giai đoạn không hợp lệ'
          });
        }
      }

      const phases = await GoalPhaseModel.updatePhaseOrders(goalId, phase_orders, userId);
      res.json({
        message: 'Sắp xếp lại thứ tự thành công',
        phases
      });
    } catch (error) {
      console.error('Error reordering phases:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Some phases not found or do not belong to this goal') {
        return res.status(400).json({
          message: 'Một số giai đoạn không tồn tại hoặc không thuộc mục tiêu này'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi sắp xếp lại thứ tự giai đoạn'
      });
    }
  }

  // Thống kê tiến độ giai đoạn
  static async getPhaseStats(req, res) {
    try {
      const { goalId, phaseId } = req.params;
      const userId = req.user.id;

      const stats = await GoalPhaseModel.getPhaseStats(goalId, phaseId, userId);

      res.json(stats);
    } catch (error) {
      console.error('Error getting phase stats:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Phase not found') {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi lấy thống kê giai đoạn'
      });
    }
  }

  // Tạo nhiệm vụ trong giai đoạn
  static async createTaskInPhase(req, res) {
    try {
      const { goalId, phaseId } = req.params;
      const { title, description, deadline, priority } = req.body;
      const userId = req.user.id;

      // Validate dữ liệu đầu vào
      if (!title || title.trim() === '') {
        return res.status(400).json({
          message: 'Title không được để trống'
        });
      }

      if (!deadline) {
        return res.status(400).json({
          message: 'Deadline không được để trống'
        });
      }

      // Kiểm tra deadline hợp lệ
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return res.status(400).json({
          message: 'Deadline không đúng định dạng'
        });
      }

      // Validate priority
      const validPriorities = ['low', 'medium', 'high'];
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
          message: 'Priority không hợp lệ'
        });
      }

      // Kiểm tra phase tồn tại và thuộc về user
      const phase = await GoalPhaseModel.getPhaseById(goalId, phaseId, userId);
      if (!phase) {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      const taskData = {
        title: title.trim(),
        description: description || '',
        deadline: deadlineDate,
        goal_id: parseInt(goalId),
        phase_id: parseInt(phaseId),
        priority: priority || 'medium',
        user_id: userId
      };

      const task = await TaskModel.createTask(taskData);

      res.status(201).json({
        message: 'Tạo nhiệm vụ trong giai đoạn thành công',
        task
      });
    } catch (error) {
      console.error('Error creating task in phase:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Phase not found') {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi tạo nhiệm vụ trong giai đoạn'
      });
    }
  }

  // Lấy danh sách nhiệm vụ trong giai đoạn
  static async getTasksInPhase(req, res) {
    try {
      const { goalId, phaseId } = req.params;
      const { status, priority, sort_by } = req.query;
      const userId = req.user.id;

      // Kiểm tra phase tồn tại và thuộc về user
      const phase = await GoalPhaseModel.getPhaseById(goalId, phaseId, userId);
      if (!phase) {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      // Lấy danh sách tasks
      const tasks = await TaskModel.getTasksByPhaseId(phaseId, {
        status,
        priority,
        sort_by
      });
      // Ensure tasks is always an array
      const safeTasks = Array.isArray(tasks) ? tasks : (tasks && typeof tasks === 'object' ? [tasks] : []);

      // Tính toán thời gian còn lại cho mỗi task
      const tasksWithRemainingTime = safeTasks.map(task => {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const remainingMs = deadline - now;
        
        let remainingTime = '';
        if (remainingMs > 0) {
          const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            remainingTime = `${days}d ${hours}h ${minutes}m`;
          } else if (hours > 0) {
            remainingTime = `${hours}h ${minutes}m`;
          } else {
            remainingTime = `${minutes}m`;
          }
        } else {
          remainingTime = 'Overdue';
        }

        return {
          ...task,
          remaining_time: remainingTime
        };
      });

      res.json({
        phase: {
          id: phase.phase.id,
          title: phase.phase.title
        },
        tasks: tasksWithRemainingTime,
        total: tasksWithRemainingTime.length,
        filters: {
          status: status || 'all',
          priority: priority || 'all',
          sort_by: sort_by || 'priority'
        }
      });
    } catch (error) {
      console.error('Error getting tasks in phase:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Phase not found') {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi lấy danh sách nhiệm vụ'
      });
    }
  }

  // Cập nhật trạng thái nhiệm vụ trong giai đoạn
  static async updateTaskStatus(req, res) {
    try {
      const { goalId, phaseId, taskId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      // Validate status
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: 'Trạng thái không hợp lệ'
        });
      }

      // Kiểm tra phase tồn tại và thuộc về user
      const phase = await GoalPhaseModel.getPhaseById(goalId, phaseId, userId);
      if (!phase) {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      // Cập nhật trạng thái task
      const updatedTask = await TaskModel.updateTaskStatus(taskId, status, userId);

      // Cập nhật tiến độ phase
      const phaseProgress = await GoalPhaseModel.updatePhaseProgress(goalId, phaseId, userId);

      res.json({
        message: 'Cập nhật trạng thái thành công',
        task: {
          id: updatedTask.id,
          status: updatedTask.status,
          completed_at: updatedTask.completed_at
        },
        phase_progress: {
          phase_id: phaseId,
          progress: phaseProgress.phase.progress,
          completed_tasks: phaseProgress.phase.completed_tasks,
          total_tasks: phaseProgress.phase.total_tasks
        },
        goal_progress: phaseProgress.goal_progress
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Phase not found') {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      if (error.message === 'Task not found') {
        return res.status(404).json({
          message: 'Không tìm thấy nhiệm vụ'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi cập nhật trạng thái nhiệm vụ'
      });
    }
  }

  // Di chuyển nhiệm vụ giữa các giai đoạn
  static async moveTask(req, res) {
    try {
      const { goalId, phaseId, taskId } = req.params;
      const { target_phase_id } = req.body;
      const userId = req.user.id;

      if (!target_phase_id) {
        return res.status(400).json({
          message: 'Target phase ID không được để trống'
        });
      }

      // Kiểm tra phase nguồn và đích tồn tại
      const sourcePhase = await GoalPhaseModel.getPhaseById(goalId, phaseId, userId);
      const targetPhase = await GoalPhaseModel.getPhaseById(goalId, target_phase_id, userId);
      console.log(sourcePhase);
      console.log(targetPhase);
      console.log("taskId", taskId);
      if (!sourcePhase || !targetPhase) {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn nguồn hoặc đích'
        });
      }

      // Di chuyển task
      const movedTask = await TaskModel.moveTaskToPhase(taskId, target_phase_id, userId);

      // Cập nhật tiến độ cả hai phase
      const sourcePhaseProgress = await GoalPhaseModel.updatePhaseProgress(goalId, phaseId, userId);
      const targetPhaseProgress = await GoalPhaseModel.updatePhaseProgress(goalId, target_phase_id, userId);

      res.json({
        message: 'Di chuyển nhiệm vụ thành công',
        task: {
          id: movedTask.id,
          title: movedTask.title,
          phase_id: movedTask.phase_id,
          updated_at: movedTask.updated_at
        },
        source_phase: {
          id: parseInt(phaseId),
          progress: sourcePhaseProgress.phase.progress
        },
        target_phase: {
          id: parseInt(target_phase_id),
          progress: targetPhaseProgress.phase.progress
        }
      });
    } catch (error) {
      console.error('Error moving task:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Phase not found') {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      if (error.message === 'Task not found') {
        return res.status(404).json({
          message: 'Không tìm thấy nhiệm vụ'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi di chuyển nhiệm vụ'
      });
    }
  }

  // Thống kê nhiệm vụ trong giai đoạn
  static async getTaskStats(req, res) {
    try {
      const { goalId, phaseId } = req.params;
      const { start_date, end_date } = req.query;
      const userId = req.user.id;

      // Kiểm tra phase tồn tại và thuộc về user
      const phase = await GoalPhaseModel.getPhaseById(goalId, phaseId, userId);
      if (!phase) {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      const stats = await TaskModel.getTaskStatsByPhaseId(phaseId, {
        start_date,
        end_date
      });

      res.json({
        phase: {
          id: phase.phase.id,
          title: phase.phase.title
        },
        ...stats
      });
    } catch (error) {
      console.error('Error getting task stats:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Phase not found') {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi lấy thống kê nhiệm vụ'
      });
    }
  }

  // Cập nhật tiến độ giai đoạn tự động
  static async updatePhaseProgress(req, res) {
    try {
      const { goalId, phaseId } = req.params;
      const userId = req.user.id;

      const result = await GoalPhaseModel.updatePhaseProgress(goalId, phaseId, userId);

      res.json({
        message: 'Cập nhật tiến độ giai đoạn thành công',
        ...result
      });
    } catch (error) {
      console.error('Error updating phase progress:', error);
      
      if (error.message === 'Goal not found or access denied') {
        return res.status(404).json({
          message: 'Không tìm thấy mục tiêu hoặc không có quyền truy cập'
        });
      }

      if (error.message === 'Phase not found') {
        return res.status(404).json({
          message: 'Không tìm thấy giai đoạn'
        });
      }

      res.status(500).json({
        message: 'Lỗi server khi cập nhật tiến độ giai đoạn'
      });
    }
  }
}

module.exports = GoalPhaseController; 