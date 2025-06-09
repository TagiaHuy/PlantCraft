// {
//     "goal_id": 1,
//     "phase_id": 1,
//     "user_id": 1,
//     "title": "Hoàn thành bài tập về State Management",
//     "description": "Làm các bài tập về Redux",
//     "deadline": "2024-01-15T23:59:59Z",
//     "priority": "high",
//     "status": "pending"
//   }
//   ```
  
//   **Response Success: (201)**
//   ```json
//   {
//     "message": "Tạo nhiệm vụ thành công",
//     "task": {
//       "id": 1,
//       "title": "Hoàn thành bài tập về State Management",
//       "description": "Làm các bài tập về Redux",
//       "deadline": "2024-01-15T23:59:59Z",
//       "goal_id": 1,
//       "priority": "high",
//       "status": "pending",
//       "estimated_duration": 120
//     }
//   }

// CREATE TABLE tasks (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     goal_id INT,
//     phase_id INT,
//     user_id INT NOT NULL,
//     title VARCHAR(200) NOT NULL,
//     description TEXT,
//     deadline DATETIME NOT NULL,
//     priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
//     status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending'
//   );
const TaskModel = require('../models/taskModel');
const TaskController = {
    createTask: async (req, res) => {
        try {
            const { goal_id, phase_id, user_id, title, description, deadline, priority} =  req.body;
            // const task = await TaskModel.createTask({
            //     goal_id,
            //     phase_id,
            //     user_id,
            //     title,
            //     description,
            //     deadline,
            //     priority,
            //     status: "pending"
            // }); 


            
            res.json({
                message: "Tạo nhiệm vụ thành công",
                task: {
                    id: task.insertId,
                    title: title,
                    description: description,
                    deadline: deadline,
                    goal_id: goal_id,
                    priority: priority,
                    status: "pending",
                }
            })
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = TaskController;    
