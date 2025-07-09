const db = require('../services/db');

class GoalPhaseModel {
  // Tạo giai đoạn mục tiêu mới
  static async createPhase(goalId, phaseData) {
    const { title, description, order_number } = phaseData;
    
    try {
      // Kiểm tra goal tồn tại
      const goalExists = await db.query(
        'SELECT id FROM goals WHERE id = ? AND user_id = ?',
        [goalId, phaseData.user_id]
      );
      
      if (goalExists.length === 0) {
        throw new Error('Goal not found or access denied');
      }

      // Kiểm tra order_number không trùng lặp
      const existingOrder = await db.query(
        'SELECT id FROM goal_phases WHERE goal_id = ? AND order_number = ?',
        [goalId, order_number]
      );
      
      if (existingOrder.length > 0) {
        throw new Error('Order number already exists for this goal');
      }

      // Tạo phase mới
      const result = await db.query(
        'INSERT INTO goal_phases (goal_id, title, description, order_number) VALUES (?, ?, ?, ?)',
        [goalId, title, description, order_number]
      );

      return {
        id: result.insertId,
        goal_id: goalId,
        title,
        description,
        order_number,
        created_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách giai đoạn của mục tiêu
  static async getPhasesByGoalId(goalId, userId) {
    try {
      // Kiểm tra goal thuộc về user
      const goalExists = await db.query(
        'SELECT id FROM goals WHERE id = ? AND user_id = ?',
        [goalId, userId]
      );
      
      if (goalExists.length === 0) {
        throw new Error('Goal not found or access denied');
      }

      // Lấy danh sách phases
      const phases = await db.query(
        'SELECT * FROM goal_phases WHERE goal_id = ? ORDER BY order_number ASC',
        [goalId]
      );

      // Tính toán tiến độ cho từng phase
      const phasesWithProgress = await Promise.all(
        phases.map(async (phase) => {
          const taskStats = await db.query(
            `SELECT 
              COUNT(*) as total_tasks,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
            FROM tasks 
            WHERE phase_id = ?`,
            [phase.id]
          );

          const stats = taskStats[0];
          const progress = stats.total_tasks > 0 
            ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
            : 0;

          let status = 'not_started';
          if (progress === 100) {
            status = 'completed';
          } else if (progress > 0) {
            status = 'in_progress';
          }

          return {
            ...phase,
            progress,
            total_tasks: stats.total_tasks,
            completed_tasks: stats.completed_tasks,
            status
          };
        })
      );

      return phasesWithProgress;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông tin chi tiết giai đoạn
  static async getPhaseById(goalId, phaseId, userId) {
    try {
      // Kiểm tra goal và phase thuộc về user
      const goalExists = await db.query(
        'SELECT id FROM goals WHERE id = ? AND user_id = ?',
        [goalId, userId]
      );
      
      if (goalExists.length === 0) {
        throw new Error('Goal not found or access denied');
      }

      const phase = await db.query(
        'SELECT * FROM goal_phases WHERE id = ? AND goal_id = ?',
        [phaseId, goalId]
      );

      if (phase.length === 0) {
        throw new Error('Phase not found');
      }

      // Tính toán tiến độ
      const taskStats = await db.query(
        `SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM tasks 
        WHERE phase_id = ?`,
        [phaseId]
      );

      const stats = taskStats[0];
      const progress = stats.total_tasks > 0 
        ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
        : 0;

      let status = 'not_started';
      if (progress === 100) {
        status = 'completed';
      } else if (progress > 0) {
        status = 'in_progress';
      }

      // Lấy danh sách tasks
      const tasks = await db.query(
        'SELECT id, title, status, priority, deadline FROM tasks WHERE phase_id = ? ORDER BY priority DESC, deadline ASC',
        [phaseId]
      );

      return {
        phase: {
          ...phase[0],
          progress,
          total_tasks: stats.total_tasks,
          completed_tasks: stats.completed_tasks,
          status
        },
        tasks
      };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thông tin giai đoạn
  static async updatePhase(goalId, phaseId, phaseData, userId) {
    try {
      console.log('Updating phase:', { goalId, phaseId, userId });
      
      // Kiểm tra quyền truy cập
      const goalExists = await db.query(
        'SELECT id FROM goals WHERE id = ? AND user_id = ?',
        [goalId, userId]
      );
      
      console.log('Goal exists:', goalExists.length > 0);
      
      if (goalExists.length === 0) {
        throw new Error('Goal not found or access denied');
      }

      const phaseExists = await db.query(
        'SELECT id FROM goal_phases WHERE id = ? AND goal_id = ?',
        [phaseId, goalId]
      );

      console.log('Phase exists:', phaseExists.length > 0, 'Phase data:', phaseExists);

      if (phaseExists.length === 0) {
        throw new Error('Phase not found');
      }

      // Kiểm tra order_number không trùng lặp (nếu có thay đổi)
      if (phaseData.order_number) {
        const existingOrder = await db.query(
          'SELECT id FROM goal_phases WHERE goal_id = ? AND order_number = ? AND id != ?',
          [goalId, phaseData.order_number, phaseId]
        );
        
        if (existingOrder.length > 0) {
          throw new Error('Order number already exists for this goal');
        }
      }

      // Cập nhật phase
      const updateFields = [];
      const updateValues = [];

      if (phaseData.title) {
        updateFields.push('title = ?');
        updateValues.push(phaseData.title);
      }
      if (phaseData.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(phaseData.description);
      }
      if (phaseData.order_number) {
        updateFields.push('order_number = ?');
        updateValues.push(phaseData.order_number);
      }

      updateValues.push(phaseId, goalId);

      const result = await db.query(
        `UPDATE goal_phases SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND goal_id = ?`,
        updateValues
      );

      if (result.affectedRows === 0) {
        throw new Error('Failed to update phase');
      }

      // Lấy thông tin đã cập nhật
      const updatedPhase = await db.query(
        'SELECT * FROM goal_phases WHERE id = ?',
        [phaseId]
      );

      return updatedPhase[0];
    } catch (error) {
      throw error;
    }
  }

  // Xóa giai đoạn mục tiêu
  static async deletePhase(goalId, phaseId, userId) {
    try {
      // Kiểm tra quyền truy cập
      const goalExists = await db.query(
        'SELECT id FROM goals WHERE id = ? AND user_id = ?',
        [goalId, userId]
      );
      
      if (goalExists.length === 0) {
        throw new Error('Goal not found or access denied');
      }

      const phaseExists = await db.query(
        'SELECT id FROM goal_phases WHERE id = ? AND goal_id = ?',
        [phaseId, goalId]
      );

      if (phaseExists.length === 0) {
        throw new Error('Phase not found');
      }

      // Kiểm tra có tasks chưa hoàn thành không
      const incompleteTasks = await db.query(
        'SELECT COUNT(*) as count FROM tasks WHERE phase_id = ? AND status != "completed"',
        [phaseId]
      );

      if (incompleteTasks[0].count > 0) {
        throw new Error('Cannot delete phase with incomplete tasks');
      }

      // Xóa tất cả tasks thuộc phase
      await db.query('DELETE FROM tasks WHERE phase_id = ?', [phaseId]);

      // Xóa phase
      const result = await db.query(
        'DELETE FROM goal_phases WHERE id = ? AND goal_id = ?',
        [phaseId, goalId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Failed to delete phase');
      }

      // Cập nhật thứ tự các phase còn lại
      await this.reorderPhases(goalId);

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Sắp xếp lại thứ tự giai đoạn
  static async reorderPhases(goalId) {
    try {
      const phases = await db.query(
        'SELECT id FROM goal_phases WHERE goal_id = ? ORDER BY order_number ASC',
        [goalId]
      );

      for (let i = 0; i < phases.length; i++) {
        await db.query(
          'UPDATE goal_phases SET order_number = ? WHERE id = ?',
          [i + 1, phases[i].id]
        );
      }
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thứ tự giai đoạn theo danh sách
  static async updatePhaseOrders(goalId, phaseOrders, userId) {
    try {
      // Kiểm tra quyền truy cập
      const goalExists = await db.query(
        'SELECT id FROM goals WHERE id = ? AND user_id = ?',
        [goalId, userId]
      );
      
      if (goalExists.length === 0) {
        throw new Error('Goal not found or access denied');
      }

      // Validate danh sách phase orders
      const phaseIds = phaseOrders.map(p => p.phase_id);
      const existingPhases = await db.query(
        'SELECT id FROM goal_phases WHERE goal_id = ? AND id IN (?)',
        [goalId, phaseIds]
      );

      if (existingPhases.length !== phaseIds.length) {
        throw new Error('Some phases not found or do not belong to this goal');
      }

      // Cập nhật thứ tự
      for (const phaseOrder of phaseOrders) {
        await db.query(
          'UPDATE goal_phases SET order_number = ? WHERE id = ? AND goal_id = ?',
          [phaseOrder.order_number, phaseOrder.phase_id, goalId]
        );
      }

      // Lấy danh sách đã cập nhật
      const updatedPhases = await db.query(
        'SELECT id, title, order_number FROM goal_phases WHERE goal_id = ? ORDER BY order_number ASC',
        [goalId]
      );

      return updatedPhases;
    } catch (error) {
      throw error;
    }
  }

  // Thống kê tiến độ giai đoạn
  static async getPhaseStats(goalId, phaseId, userId) {
    try {
      // Kiểm tra quyền truy cập
      const goalExists = await db.query(
        'SELECT id FROM goals WHERE id = ? AND user_id = ?',
        [goalId, userId]
      );
      
      if (goalExists.length === 0) {
        throw new Error('Goal not found or access denied');
      }

      const phase = await db.query(
        'SELECT * FROM goal_phases WHERE id = ? AND goal_id = ?',
        [phaseId, goalId]
      );

      if (phase.length === 0) {
        throw new Error('Phase not found');
      }

      // Thống kê tasks
      const taskStats = await db.query(
        `SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
          SUM(CASE WHEN status != 'completed' AND deadline < NOW() THEN 1 ELSE 0 END) as overdue_tasks,
          AVG(CASE WHEN status = 'completed' THEN TIMESTAMPDIFF(MINUTE, created_at, completed_at) END) as avg_completion_time
        FROM tasks 
        WHERE phase_id = ?`,
        [phaseId]
      );

      const stats = taskStats[0];
      const completionRate = stats.total_tasks > 0 
        ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
        : 0;

      // Timeline data (7 ngày gần nhất)
      const timeline = await db.query(
        `SELECT 
          DATE(completed_at) as date,
          COUNT(*) as completed_tasks
        FROM tasks 
        WHERE phase_id = ? AND status = 'completed' AND completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(completed_at)
        ORDER BY date ASC`,
        [phaseId]
      );

      // Phân bố theo priority
      const priorityDistribution = await db.query(
        `SELECT 
          priority,
          COUNT(*) as count
        FROM tasks 
        WHERE phase_id = ?
        GROUP BY priority`,
        [phaseId]
      );

      return {
        phase: {
          id: phase[0].id,
          title: phase[0].title
        },
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
        timeline,
        priority_distribution: priorityDistribution.reduce((acc, item) => {
          acc[item.priority] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật tiến độ giai đoạn tự động
  static async updatePhaseProgress(goalId, phaseId, userId) {
    try {
      // Kiểm tra quyền truy cập
      const goalExists = await db.query(
        'SELECT id FROM goals WHERE id = ? AND user_id = ?',
        [goalId, userId]
      );
      
      if (goalExists.length === 0) {
        throw new Error('Goal not found or access denied');
      }

      const phase = await db.query(
        'SELECT * FROM goal_phases WHERE id = ? AND goal_id = ?',
        [phaseId, goalId]
      );

      if (phase.length === 0) {
        throw new Error('Phase not found');
      }

      // Tính toán tiến độ
      const taskStats = await db.query(
        `SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM tasks 
        WHERE phase_id = ?`,
        [phaseId]
      );

      const stats = taskStats[0];
      const progress = stats.total_tasks > 0 
        ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
        : 0;

      // Xác định trạng thái phase
      let status = 'not_started';
      if (progress === 100) {
        status = 'completed';
      } else if (progress > 0) {
        status = 'in_progress';
      }

      // Cập nhật tiến độ tổng thể của goal
      const goalPhases = await db.query(
        'SELECT id FROM goal_phases WHERE goal_id = ?',
        [goalId]
      );

      const totalPhases = goalPhases.length;
      const completedPhases = await db.query(
        `SELECT COUNT(*) as count FROM goal_phases gp
         WHERE gp.goal_id = ? AND gp.id IN (
           SELECT DISTINCT phase_id FROM tasks 
           WHERE goal_id = ? AND status = 'completed'
         )`,
        [goalId, goalId]
      );

      const goalProgress = totalPhases > 0 
        ? Math.round((completedPhases[0].count / totalPhases) * 100)
        : 0;

      // Cập nhật tiến độ goal
      await db.query(
        'UPDATE goals SET progress = ? WHERE id = ?',
        [goalProgress, goalId]
      );

      // Lấy phase tiếp theo
      const nextPhase = await db.query(
        'SELECT id, title FROM goal_phases WHERE goal_id = ? AND order_number > (SELECT order_number FROM goal_phases WHERE id = ?) ORDER BY order_number ASC LIMIT 1',
        [goalId, phaseId]
      );

      return {
        phase: {
          id: phase[0].id,
          title: phase[0].title,
          progress,
          status,
          completed_tasks: stats.completed_tasks,
          total_tasks: stats.total_tasks
        },
        goal_progress: {
          goal_id: goalId,
          progress: goalProgress,
          completed_phases: completedPhases[0].count,
          total_phases: totalPhases
        },
        next_phase: nextPhase.length > 0 ? nextPhase[0] : null
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GoalPhaseModel; 