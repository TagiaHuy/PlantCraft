// Database service for handling MySQL connections and queries
require('dotenv').config();
const mysql = require('mysql2/promise');

// Create a connection pool instead of a single connection
// This is more efficient for handling multiple requests
let pool = null;

/**
 * Initialize the database connection pool
 */
const initializePool = async () => {
  try {
    // Ensure pool is only created once
    if (pool) return pool;

    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10, // Max number of connections
      queueLimit: 0,       // Unlimited queue limit
      acquireTimeout: 30000, // Timeout for acquiring a connection
    });

    console.log('Database connection pool initialized');
    return pool;
  } catch (error) {
    console.error('Error initializing database pool:', error);
    throw error;
  }
};

/**
 * Get the database connection pool
 * @returns {Pool} MySQL connection pool
 */
const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializePool first.');
  }
  return pool;
};

/**
 * Execute a SQL query with parameters
 * @param {string} sql - SQL query string
 * @param {Array} params - Parameters for the query
 * @returns {Promise<Array>} Query results
 */
const query = async (sql, params = []) => {
  try {
    const [results] = await getPool().execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Close the database pool (useful for graceful shutdown)
 */
const closePool = async () => {
  try {
    if (pool) {
      await pool.end();  // Gracefully close the pool
      console.log('Database pool closed');
    }
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

module.exports = {
  initializePool,
  getPool,
  query,
  closePool  // Add closePool method to close pool when necessary
};
