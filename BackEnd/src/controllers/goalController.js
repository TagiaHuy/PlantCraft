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
  }
};

module.exports = GoalController;