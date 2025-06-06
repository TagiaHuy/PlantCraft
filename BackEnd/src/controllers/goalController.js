const GoalModel = require('../models/goalModel');

const GoalController = {
  createGoal: async (req, res) => {  // Đổi tên function từ register thành createGoal
    try {
      const { user_id, title, description, start_date, end_date, priority } = req.body;
      const result = await GoalModel.createGoal({ user_id, title, description, start_date, end_date, priority });
      res.status(201).json({
        message: 'Tạo mục tiêu thành công.',
        goal: {
            id: result.insertId,
            title: title,
            description: description,
            start_date: start_date,
            end_date: end_date,
            priority: priority,
            status: 'in_progress'
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Đã có lỗi xảy ra khi tạo mục tiêu.' });
      console.log(error);
    }
  },

  updateGoal: async (req, res) => {
    try {
        const goalId = req.params.id;
        const { title, description, start_date, end_date, priority } = req.body;
        const user_id = req.user.id; // Lấy từ JWT token

        // Kiểm tra mục tiêu có tồn tại không
        
        const existingGoal = await GoalModel.getGoalById(goalId, user_id);
        if (!existingGoal) {
            return res.status(404).json({ message: 'Không tìm thấy mục tiêu' });
        }

        const result = await GoalModel.updateGoal(goalId, {
            title,
            description,
            start_date,
            end_date,
            priority,
            user_id
        });

        res.json({
            message: 'Cập nhật mục tiêu thành công',
            goal: {
                id: goalId,
                title,
                description,
                start_date,
                end_date,
                priority,
                status: existingGoal.status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật mục tiêu' });
    }
},


deleteGoal: async (req, res) => {
    try {
        const goalId = req.params.id;
        const user_id = req.user.id;

        // Kiểm tra mục tiêu có tồn tại không
        const existingGoal = await GoalModel.getGoalById(goalId, user_id);
        if (!existingGoal) {
            return res.status(404).json({ message: 'Không tìm thấy mục tiêu' });
        }

        await GoalModel.deleteGoal(goalId, user_id);
        res.json({ message: 'Xóa mục tiêu thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra khi xóa mục tiêu' });
    }
}

};

module.exports = GoalController;