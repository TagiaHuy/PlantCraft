const AnalyticsController = {
    // ⏱️ API Thống kê thời gian làm việc
    getTimeTrackingSummary: async (req, res) => {
        try {
            const { range = 'week' } = req.query;
            
            // Sample response for time tracking summary
            const sampleResponse = {
                totalHours: 156,
                averagePerDay: 5.2,
                mostProductiveDay: "Wednesday",
                weeklyData: [
                    { "day": "Mon", "hours": 6.5, "tasks": 8 },
                    { "day": "Tue", "hours": 4.8, "tasks": 6 },
                    { "day": "Wed", "hours": 7.2, "tasks": 10 },
                    { "day": "Thu", "hours": 5.1, "tasks": 7 },
                    { "day": "Fri", "hours": 4.3, "tasks": 5 },
                    { "day": "Sat", "hours": 3.8, "tasks": 4 },
                    { "day": "Sun", "hours": 2.1, "tasks": 2 }
                ]
            };

            res.json(sampleResponse);
        } catch (error) {
            console.error('Error getting time tracking summary:', error);
            res.status(500).json({ 
                message: "Lỗi server khi lấy thống kê thời gian làm việc",
                error: error.message 
            });
        }
    },

    // 💡 API Gợi ý năng suất
    getProductivityInsights: async (req, res) => {
        try {
            const { range = 'week' } = req.query;
            
            // Sample response for productivity insights
            const sampleResponse = [
                { "type": "positive", "message": "You completed 15% more tasks this week compared to last week!" },
                { "type": "suggestion", "message": "Try working on high-priority tasks in the morning for better focus." },
                { "type": "achievement", "message": "You achieved your daily goal 5 out of 7 days this week." }
            ];

            res.json(sampleResponse);
        } catch (error) {
            console.error('Error getting productivity insights:', error);
            res.status(500).json({ 
                message: "Lỗi server khi lấy gợi ý năng suất",
                error: error.message 
            });
        }
    }
};

module.exports = AnalyticsController; 