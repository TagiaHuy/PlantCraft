const db = require('../services/db');

const TaskModel = {
    // Tạo task mới
    createTask: async (taskData) => {
        try {
            const { title, description, deadline, goal_id, phase_id, priority, user_id } = taskData;
            
            const query = `
                INSERT INTO tasks (title, description, deadline, goal_id, phase_id, priority, user_id, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
            `;
            
            const result = await db.query(query, [title, description, deadline, goal_id, phase_id, priority, user_id]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Lấy task theo ID
    getTaskById: async (taskId, userId) => {
        try {
            const query = `
                SELECT t.*, g.name as goal_title, gp.title as phase_title
                FROM tasks t 
                LEFT JOIN goals g ON t.goal_id = g.id 
                LEFT JOIN goal_phases gp ON t.phase_id = gp.id
                WHERE t.id = ? AND t.user_id = ?
            `;
            
            console.log('getTaskById query:', query);
            console.log('getTaskById params:', [taskId, userId]);
            
            const [rows] = await db.query(query, [taskId, userId]);
            console.log('getTaskById rows:', rows);
            
            // Handle case where rows might be an object or array
            if (Array.isArray(rows)) {
                return rows[0];
            } else if (rows && typeof rows === 'object') {
                return rows;
            } else {
                return undefined;
            }
        } catch (error) {
            throw error;
        }
    },

    // Lấy danh sách tasks hôm nay
    getTodayTasks: async (userId) => {
        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

            const query = `  
                SELECT t.*, g.name as goal_title, gp.title as phase_title,
                       TIMESTAMPDIFF(MINUTE, NOW(), t.deadline) as remaining_minutes
                FROM tasks t 
                LEFT JOIN goals g ON t.goal_id = g.id 
                LEFT JOIN goal_phases gp ON t.phase_id = gp.id
                WHERE t.user_id = ?  
                AND t.deadline BETWEEN ? AND ?   
                AND t.status != 'completed'
                ORDER BY t.priority DESC, t.deadline ASC
            `;
            
            const rows = await db.query(query, [userId, startOfDay, endOfDay]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Cập nhật trạng thái task
    updateTaskStatus: async (taskId, status, userId) => {
        try {
            const query = `
                UPDATE tasks 
                SET status = ?, 
                    completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE NULL END,
                    updated_at = NOW()
                WHERE id = ? AND user_id = ?
            `;
            
            const result = await db.query(query, [status, status, taskId, userId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Lấy thống kê tasks
    getTaskStatistics: async (userId, startDate, endDate) => {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_tasks,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                    SUM(CASE WHEN deadline < NOW() AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks,
                    AVG(CASE WHEN status = 'completed' THEN TIMESTAMPDIFF(MINUTE, created_at, completed_at) END) as avg_completion_time
                FROM tasks 
                WHERE user_id = ? 
                AND created_at BETWEEN ? AND ?
            `;
            
            const [rows] = await db.query(query, [userId, startDate, endDate]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Lấy tasks theo goal
    getTasksByGoal: async (goalId, userId) => {
        try {
            const query = `
                SELECT * FROM tasks 
                WHERE goal_id = ? AND user_id = ?
                ORDER BY created_at DESC
            `;
            
            const [rows] = await db.query(query, [goalId, userId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Xóa task
    deleteTask: async (taskId, userId) => {
        try {
            const query = `DELETE FROM tasks WHERE id = ? AND user_id = ?`;
            const result = await db.query(query, [taskId, userId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Lấy tasks theo phase ID
    getTasksByPhaseId: async (phaseId, filters = {}) => {
        try {
            let query = `
                SELECT t.*, g.name as goal_title
                FROM tasks t 
                LEFT JOIN goals g ON t.goal_id = g.id 
                WHERE t.phase_id = ?
            `;
            const params = [phaseId];

            // Áp dụng filters
            if (filters.status && filters.status !== 'all') {
                query += ` AND t.status = ?`;
                params.push(filters.status);
            }

            if (filters.priority && filters.priority !== 'all') {
                query += ` AND t.priority = ?`;
                params.push(filters.priority);
            }

            // Sắp xếp
            let orderBy = 't.priority DESC, t.deadline ASC';
            if (filters.sort_by) {
                switch (filters.sort_by) {
                    case 'deadline':
                        orderBy = 't.deadline ASC';
                        break;
                    case 'created_at':
                        orderBy = 't.created_at DESC';
                        break;
                    case 'priority':
                    default:
                        orderBy = 't.priority DESC, t.deadline ASC';
                        break;
                }
            }

            query += ` ORDER BY ${orderBy}`;
            const rows = await db.query(query, params);
            console.log("row:", rows);
            // console.log("asdf" + await db.query(query, params));
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Di chuyển task giữa các phases
    moveTaskToPhase: async (taskId, targetPhaseId, userId) => {
        try {
            console.log('moveTaskToPhase called with:', { taskId, targetPhaseId, userId });
            
            // Kiểm tra task tồn tại và thuộc về user
            const task = await TaskModel.getTaskById(taskId, userId);
            console.log('getTaskById result:', task);
            
            if (!task) {
                throw new Error('Task not found');
            }

            // Cập nhật phase_id của task
            const query = `
                UPDATE tasks 
                SET phase_id = ?, updated_at = NOW()
                WHERE id = ? AND user_id = ?
            `;
            
            const result = await db.query(query, [targetPhaseId, taskId, userId]);
            console.log('UPDATE result:', result);
            
            if (result.affectedRows === 0) {
                throw new Error('Failed to move task');
            }

            // Lấy thông tin task đã cập nhật
            const updatedTask = await TaskModel.getTaskById(taskId, userId);
            return updatedTask;
        } catch (error) {
            throw error;
        }
    },

    // Thống kê tasks theo phase
    getTaskStatsByPhaseId: async (phaseId, filters = {}) => {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_tasks,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
                    SUM(CASE WHEN status != 'completed' AND deadline < NOW() THEN 1 ELSE 0 END) as overdue_tasks,
                    AVG(CASE WHEN status = 'completed' THEN TIMESTAMPDIFF(MINUTE, created_at, completed_at) END) as avg_completion_time
                FROM tasks 
                WHERE phase_id = ?
            `;
            const params = [phaseId];

            // Áp dụng filters theo thời gian
            if (filters.start_date && filters.end_date) {
                query += ` AND created_at BETWEEN ? AND ?`;
                params.push(filters.start_date, filters.end_date);
            }

            const [stats] = await db.query(query, params);
            
            const completionRate = stats.total_tasks > 0 
                ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
                : 0;

            // Timeline data (7 ngày gần nhất)
            const timelineQuery = `
                SELECT 
                    DATE(completed_at) as date,
                    COUNT(*) as completed_tasks
                FROM tasks 
                WHERE phase_id = ? AND status = 'completed' AND completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(completed_at)
                ORDER BY date ASC
            `;
            const [timeline] = await db.query(timelineQuery, [phaseId]);

            // Phân bố theo priority
            const priorityQuery = `
                SELECT 
                    priority,
                    COUNT(*) as count
                FROM tasks 
                WHERE phase_id = ?
                GROUP BY priority
            `;
            const [priorityDistribution] = await db.query(priorityQuery, [phaseId]);

            return {
                statistics: {
                    total_tasks: stats.total_tasks,
                    completed_tasks: stats.completed_tasks,
                    in_progress_tasks: stats.in_progress_tasks,
                    pending_tasks: stats.pending_tasks,
                    overdue_tasks: stats.overdue_tasks,
                    completion_rate: completionRate,
                    average_completion_time: Math.round(stats.avg_completion_time || 0),
                    estimated_remaining_time: Math.round((stats.total_tasks - stats.completed_tasks) * (stats.avg_completion_time || 60))
                },
                daily_progress: timeline,
                priority_distribution: (Array.isArray(priorityDistribution) ? priorityDistribution : []).reduce((acc, item) => {
                    acc[item.priority] = item.count;
                    return acc;
                }, {})
            };
        } catch (error) {
            throw error;
        }
    },

    // Thống kê tasks theo phase (cho statistics tổng hợp)
    getTaskStatisticsByPhase: async (userId, startDate, endDate) => {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_tasks,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
                    SUM(CASE WHEN status != 'completed' AND deadline < NOW() THEN 1 ELSE 0 END) as overdue_tasks
                FROM tasks 
                WHERE user_id = ? AND phase_id IS NOT NULL
                AND created_at BETWEEN ? AND ?
            `;
            
            const [rows] = await db.query(query, [userId, startDate, endDate]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Thống kê tasks độc lập (không thuộc phase)
    getTaskStatisticsIndependent: async (userId, startDate, endDate) => {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_tasks,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
                    SUM(CASE WHEN status != 'completed' AND deadline < NOW() THEN 1 ELSE 0 END) as overdue_tasks
                FROM tasks 
                WHERE user_id = ? AND phase_id IS NULL
                AND created_at BETWEEN ? AND ?
            `;
            
            const [rows] = await db.query(query, [userId, startDate, endDate]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Lấy tất cả tasks với pagination và filters
    getAllTasks: async (userId, filters = {}) => {
        try {
            console.log('getAllTasks filters:', filters);
            
            let query = `
                SELECT t.*, g.name as goal_title, gp.title as phase_title
                FROM tasks t 
                LEFT JOIN goals g ON t.goal_id = g.id 
                LEFT JOIN goal_phases gp ON t.phase_id = gp.id
                WHERE t.user_id = ?
            `;
            const params = [userId];

            // Áp dụng filters
            if (filters.goal_id) {
                query += ` AND t.goal_id = ?`;
                params.push(filters.goal_id);
            }

            if (filters.phase_id) {
                query += ` AND t.phase_id = ?`;
                params.push(filters.phase_id);
            }

            if (filters.status && filters.status !== 'all') {
                query += ` AND t.status = ?`;
                params.push(filters.status);
            }

            if (filters.priority && filters.priority !== 'all') {
                query += ` AND t.priority = ?`;
                params.push(filters.priority);
            }

            // Đếm tổng số records
            const countQuery = query.replace('SELECT t.*, g.name as goal_title, gp.title as phase_title', 'SELECT COUNT(*) as total');
            const [countResult] = await db.query(countQuery, params);
            console.log('countResult:', countResult);
            
            // Ensure countResult is safe
            const safeCountResult = Array.isArray(countResult) && countResult.length > 0 ? countResult : [{ total: 0 }];
            const total = safeCountResult[0].total || 0;

            // Thêm ORDER BY và LIMIT
            query += ` ORDER BY t.priority DESC, t.deadline ASC`;
            
            if (filters.page && filters.limit) {
                const offset = Math.floor((filters.page - 1) * filters.limit);
                const limit = Math.floor(filters.limit);
                query += ` LIMIT ${limit} OFFSET ${offset}`;
                // Using string interpolation to avoid prepared statement issues
            }

            console.log('getAllTasks query:', query);
            console.log('getAllTasks params:', params);
            
            const [tasks] = await db.query(query, params);
            console.log('tasks:', tasks);

            return {
                tasks: Array.isArray(tasks) ? tasks : [],
                total
            };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = TaskModel; 