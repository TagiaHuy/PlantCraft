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
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
});
