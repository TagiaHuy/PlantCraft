const config = {
  port: process.env.PORT || 3000,
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
};

module.exports = config;