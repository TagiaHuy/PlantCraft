
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
const db = require('../services/db');

const TaskModel = {
    /**
   * Create task
   * @param {Object} task - Task data
   * @returns {Promise<Object>} Result with insertId
   */
  createTask: async (task) => {
    try {
        const query = 'INSERT INTO tasks (goal_id, phase_id, user_id, title, description, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [
            task.goal_id,
            task.phase_id,
            task.user_id,
            task.title,
            task.description,
            task.deadline,
            task.priority,
            task.status
      ];
      return await db.query(query, params);
    } catch (error) {
      console.error('Error creating pending registration:', error);
      throw error;
    }
  }
}

module.exports = TaskModel;