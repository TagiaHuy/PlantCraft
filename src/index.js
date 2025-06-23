const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes/api');
const dbService = require('./services/db');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// API Routes
app.use('/api', apiRoutes);

// Start server and DB connection only if run directly from CLI
if (require.main === module) {
    const port = process.env.PORT || 3000;

    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

    dbService.initializePool()
        .then(() => {
            console.log('Database connection established');
        })
        .catch(err => {
            console.error('Failed to connect to database:', err);
            // Exit process with failure code
            process.exit(1);
        });
    
    const gracefulShutdown = (signal) => {
        console.log(`Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
            console.log('HTTP server closed.');
            dbService.closePool().then(() => {
                console.log('Database pool closed.');
                process.exit(0);
            }).catch(err => {
                console.error('Error closing database pool:', err);
                process.exit(1);
            });
        });
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;