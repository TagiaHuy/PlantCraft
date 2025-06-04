const db = require('../services/db');

const GoalModel = {
    /**
     * Create a new goal
     * @param {Object} goalData - Goal data
     * @returns {Promise<Object>} Result with insertId
     */
    createGoal: async (goalData) => {
        try {
            const query = 'INSERT INTO goals (user_id, title, description, start_date, end_date, priority) VALUES (?, ?, ?, ?, ?, ?)';
            const params = [goalData.user_id, goalData.title, goalData.description, goalData.start_date, goalData.end_date, goalData.priority];
            return await db.query(query, params);
        } catch (error) {
            console.error("error creating new goal");
            throw error;
        }
    }
};
module.exports = GoalModel;