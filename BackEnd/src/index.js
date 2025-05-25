const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

// ✅ Đặt cors ở đây — trước các route!
app.use(cors({
  origin: '*', // hoặc '*' nếu đang test
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Các route bên dưới
app.use('/api', apiRoutes);

// Khởi động server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
