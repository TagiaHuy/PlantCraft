const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes/api');
const dbService = require('./services/db');

const app = express();

// Initialize database connection
dbService.initializePool()
  .then(() => {
    console.log('Database connection established');
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
  });

// ✅ Đặt cors ở đây — trước các route!
app.use(cors({
  origin: '*', // hoặc '*' nếu đang test
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Các route bên dưới
app.use('/api', apiRoutes);

// Serve static files from the public directory
app.use(express.static('public')); 

// Khởi động server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
