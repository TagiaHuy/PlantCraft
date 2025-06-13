// {
//     "title": "Hoàn thành bài tập về State Management",
//     "description": "Làm các bài tập về Redux",
//     "deadline": "2024-01-15T23:59:59Z",
//     "goal_id": 1,
//     "priority": "high"
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
const TaskController = {
    createTask: async (req, res) => {
        try {
            const { title, description, deadline, goal_id, priority } =  req.body;
            res.json({
                message: "Tạo nhiệm vụ thành công",
                task: {
                    id: 1,
                    title: title,
                    description: description,
                    deadline: deadline,
                    goal_id: goal_id,
                    priority: priority,
                    status: "pending",
                    estimated_duration: 120
                }
            })
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = TaskController;    
