const TaskModel = require('../models/taskModel');

const TaskController = {
    // Tạo nhiệm vụ mới (có thể thuộc phase hoặc không)
    createTask: async (req, res) => {
        try {
            const { title, description, deadline, goal_id, phase_id, priority } = req.body;
            const user_id = req.user.id;

            // Validate dữ liệu đầu vào
            if (!title || !deadline || !goal_id) {
                return res.status(400).json({
                    message: "Thiếu thông tin bắt buộc: title, deadline, goal_id"
                });
            }

            // Validate deadline
            const deadlineDate = new Date(deadline);
            if (isNaN(deadlineDate.getTime())) {
                return res.status(400).json({
                    message: "Định dạng deadline không hợp lệ"
                });
            }

            // Validate priority
            const validPriorities = ['Low', 'Medium', 'High'];
            if (priority && !validPriorities.includes(priority)) {
                return res.status(400).json({
                    message: "Priority phải là: Low, Medium, hoặc High"
                });
            }

            // Kiểm tra goal tồn tại và thuộc về user
            const GoalModel = require('../models/goalModel');
            const goal = await GoalModel.getGoalById(goal_id, user_id);
            if (!goal) {
                return res.status(404).json({
                    message: "Không tìm thấy mục tiêu hoặc không có quyền truy cập"
                });
            }

            // Nếu có phase_id, kiểm tra phase tồn tại và thuộc về goal
            if (phase_id) {
                const GoalPhaseModel = require('../models/goalPhaseModel');
                try {
                    await GoalPhaseModel.getPhaseById(goal_id, phase_id, user_id);
                } catch (error) {
                    return res.status(404).json({
                        message: "Không tìm thấy giai đoạn hoặc không có quyền truy cập"
                    });
                }
            }

            // Tạo task trong database
            const taskData = {
                title,
                description: description || '',
                deadline,
                goal_id,
                phase_id: phase_id || null,
                priority: priority || 'medium',
                user_id
            };

            const taskId = await TaskModel.createTask(taskData);

            // Lấy thông tin task vừa tạo
            const task = await TaskModel.getTaskById(taskId, user_id);

            res.status(201).json({
                message: "Tạo nhiệm vụ thành công",
                task
            });
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({ 
                message: "Lỗi server khi tạo nhiệm vụ",
                error: error.message 
            });
        }
    },

    // Xem danh sách nhiệm vụ hôm nay (bao gồm cả task trong phase và task độc lập)
    getTodayTasks: async (req, res) => {
        try {
            const user_id = req.user.id;

            // Lấy tasks từ database (bao gồm cả task trong phase và task độc lập)
            const tasks = await TaskModel.getTodayTasks(user_id);
            console.log(tasks);
            // Ensure tasks is always an array
            let safeTasks = [];
            if (Array.isArray(tasks)) {
                safeTasks = tasks;
            } else if (tasks && typeof tasks === 'object') {
                safeTasks = [tasks];
            } else {
                safeTasks = [];
            }

            // Format dữ liệu trả về
            const formattedTasks = safeTasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                deadline: task.deadline,
                goal: {
                    id: task.goal_id,
                    title: task.goal_title
                },
                phase: task.phase_id ? {
                    id: task.phase_id,
                    title: task.phase_title
                } : null,
                priority: task.priority,
                status: task.status,
                suggested_duration: task.estimated_duration || 60,
                remaining_time: formatRemainingTime(task.remaining_minutes)
            }));

            const total = formattedTasks.length;
            const totalDuration = formattedTasks.reduce((sum, task) => sum + task.suggested_duration, 0);

            res.json({
                tasks: formattedTasks,
                total,
                total_duration: totalDuration
            });
        } catch (error) {
            console.error('Error getting today tasks:', error);
            res.status(500).json({ 
                message: "Lỗi server khi lấy danh sách nhiệm vụ hôm nay",
                error: error.message 
            });
        }
    },

    // Cập nhật trạng thái nhiệm vụ (cho task độc lập hoặc task trong phase)
    updateTaskStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const user_id = req.user.id;

            // Validate status
            const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Status không hợp lệ. Phải là: pending, in_progress, completed, hoặc cancelled"
                });
            }

            // Kiểm tra task tồn tại và thuộc về user
            const task = await TaskModel.getTaskById(id, user_id);
            if (!task) {
                return res.status(404).json({
                    message: "Không tìm thấy task hoặc không có quyền cập nhật"
                });
            }

            // Cập nhật status trong database
            const updated = await TaskModel.updateTaskStatus(id, status, user_id);
            
            if (!updated) {
                return res.status(404).json({
                    message: "Không tìm thấy task hoặc không có quyền cập nhật"
                });
            }

            // Lấy thông tin task đã cập nhật
            const updatedTask = await TaskModel.getTaskById(id, user_id);

            // Nếu task thuộc phase, cập nhật tiến độ phase
            let phaseProgress = null;
            let goalProgress = null;

            if (updatedTask.phase_id) {
                const GoalPhaseModel = require('../models/goalPhaseModel');
                try {
                    const progressResult = await GoalPhaseModel.updatePhaseProgress(
                        updatedTask.goal_id, 
                        updatedTask.phase_id, 
                        user_id
                    );
                    phaseProgress = progressResult.phase;
                    goalProgress = progressResult.goal_progress;
                } catch (error) {
                    console.error('Error updating phase progress:', error);
                }
            }

            res.json({
                message: "Cập nhật trạng thái thành công",
                task: {
                    id: updatedTask.id,
                    status: updatedTask.status,
                    completed_at: updatedTask.completed_at
                },
                phase_progress: phaseProgress,
                goal_progress: goalProgress
            });
        } catch (error) {
            console.error('Error updating task status:', error);
            res.status(500).json({ 
                message: "Lỗi server khi cập nhật trạng thái nhiệm vụ",
                error: error.message 
            });
        }
    },

    // Xem thống kê nhiệm vụ tổng hợp (bao gồm cả task trong phase và task độc lập)
    getTaskStatistics: async (req, res) => {
        try {
            const user_id = req.user.id;
            const { start_date, end_date, group_by = 'day' } = req.query;

            // Validate date parameters
            let startDate, endDate;
            if (start_date && end_date) {
                startDate = new Date(start_date);
                endDate = new Date(end_date);
                
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    return res.status(400).json({
                        message: "Định dạng ngày không hợp lệ"
                    });
                }

                if (startDate > endDate) {
                    return res.status(400).json({
                        message: "start_date phải nhỏ hơn hoặc bằng end_date"
                    });
                }
            } else {
                // Default: 30 ngày gần nhất
                endDate = new Date();
                startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            // Lấy thống kê từ database
            const stats = await TaskModel.getTaskStatistics(user_id, startDate, endDate);
            console.log('stats:', stats);

            // Ensure stats is an object with default values
            const safeStats = stats && typeof stats === 'object' ? stats : {
                total_tasks: 0,
                completed_tasks: 0,
                overdue_tasks: 0,
                avg_completion_time: 0
            };

            const completionRate = safeStats.total_tasks > 0 
                ? Math.round((safeStats.completed_tasks / safeStats.total_tasks) * 100) 
                : 0;

            // Phân tích theo phase và task độc lập
            const phaseStats = await TaskModel.getTaskStatisticsByPhase(user_id, startDate, endDate);
            const independentStats = await TaskModel.getTaskStatisticsIndependent(user_id, startDate, endDate);
            console.log('phaseStats:', phaseStats);
            console.log('independentStats:', independentStats);

            // Ensure phaseStats and independentStats are objects with default values
            const safePhaseStats = phaseStats && typeof phaseStats === 'object' ? phaseStats : {
                total_tasks: 0,
                completed_tasks: 0
            };
            const safeIndependentStats = independentStats && typeof independentStats === 'object' ? independentStats : {
                total_tasks: 0,
                completed_tasks: 0
            };

            const statistics = {
                total_tasks: safeStats.total_tasks || 0,
                completed_tasks: safeStats.completed_tasks || 0,
                overdue_tasks: safeStats.overdue_tasks || 0,
                completion_rate: completionRate,
                average_completion_time: Math.round(safeStats.avg_completion_time || 0),
                phase_tasks: {
                    total: safePhaseStats.total_tasks || 0,
                    completed: safePhaseStats.completed_tasks || 0,
                    completion_rate: safePhaseStats.total_tasks > 0 
                        ? Math.round((safePhaseStats.completed_tasks / safePhaseStats.total_tasks) * 100) 
                        : 0
                },
                independent_tasks: {
                    total: safeIndependentStats.total_tasks || 0,
                    completed: safeIndependentStats.completed_tasks || 0,
                    completion_rate: safeIndependentStats.total_tasks > 0 
                        ? Math.round((safeIndependentStats.completed_tasks / safeIndependentStats.total_tasks) * 100) 
                        : 0
                },
                analysis: {
                    peak_performance_time: "Morning (9-11 AM)",
                    common_delays: ["Complex tasks", "Multiple dependencies"],
                    suggestions: [
                        "Schedule complex tasks during peak performance hours",
                        "Break down large tasks into smaller subtasks",
                        "Organize tasks into phases for better progress tracking"
                    ]
                }
            };

            res.json({
                statistics
            });
        } catch (error) {
            console.error('Error getting task statistics:', error);
            res.status(500).json({ 
                message: "Lỗi server khi lấy thống kê nhiệm vụ",
                error: error.message 
            });
        }
    },

    // Lấy danh sách tất cả tasks của user (có thể lọc theo goal, phase)
    getAllTasks: async (req, res) => {
        try {
            const user_id = req.user.id;
            const { goal_id, phase_id, status, priority, page = 1, limit = 10 } = req.query;

            // Validate pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            
            if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
                return res.status(400).json({
                    message: "Tham số page và limit phải là số nguyên dương"
                });
            }

            // Lấy tasks từ database
            const filters = {
                goal_id: goal_id ? parseInt(goal_id) : null,
                phase_id: phase_id ? parseInt(phase_id) : null,
                status,
                priority,
                page: pageNum,
                limit: limitNum
            };

            const result = await TaskModel.getAllTasks(user_id, filters);

            res.json({
                tasks: result.tasks,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: result.total,
                    total_pages: Math.ceil(result.total / limitNum)
                },
                filters
            });
        } catch (error) {
            console.error('Error getting all tasks:', error);
            res.status(500).json({ 
                message: "Lỗi server khi lấy danh sách nhiệm vụ",
                error: error.message 
            });
        }
    }
};

// Helper function để format thời gian còn lại
function formatRemainingTime(minutes) {
    if (!minutes || minutes < 0) return "Quá hạn";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    } else {
        return `${mins}m`;
    }
}

module.exports = TaskController;    
