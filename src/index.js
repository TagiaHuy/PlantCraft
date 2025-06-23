const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const dbService = require('./services/db');

const app = express();
const port = process.env.PORT || 3000;

// ✅ Đặt cors ở đây — trước các route!
app.use(cors({
  origin: '*',  // Chỉ định '*' để tất cả các nguồn gốc đều có thể truy cập. Tuy nhiên, hãy thay đổi khi sản xuất.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Các route bên dưới
app.use('/api', apiRoutes);

// Serve static files from the public directory
app.use(express.static('public'));

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Initialize database connection
dbService.initializePool()
  .then(() => {
    console.log('Database connection established');
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal. Performing graceful shutdown...');
  
  // Close database pool
  try {
    await dbService.closePool();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }

  // Close the server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);  // Exit the process after everything is closed
  });
});

// Handle SIGINT (Ctrl+C) for graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT signal. Performing graceful shutdown...');
  
  // Close database pool
  try {
    await dbService.closePool();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }

  // Close the server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);  // Exit the process after everything is closed
  });
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = app;