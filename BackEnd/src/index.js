const express = require('express');
const cors = require('cors');
const config = require('./config');
const messageRoutes = require('./routes/message');
const todoRoutes = require('./routes/todo');

const app = express();

// Middleware
app.use(cors(config.corsOptions));
app.use(express.json());

// Routes
app.use('/api', messageRoutes);
app.use('/api', todoRoutes);

// Khởi động server
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server running on port ${config.port}`)
});

// Xử lý graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Performing graceful shutdown...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
