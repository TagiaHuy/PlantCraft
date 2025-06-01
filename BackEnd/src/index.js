const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
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

// ✅ Add route test
app.get('/', (req, res) => {
  res.send('API is working!');
});
=======
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
>>>>>>> feature/login

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
