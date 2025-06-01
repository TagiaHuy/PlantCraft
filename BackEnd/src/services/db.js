// db.js
// Database service for handling MySQL connections and queries

const mysql = require('mysql2/promise');

// Create a connection pool instead of a single connection
// This is more efficient for handling multiple requests
let pool = null;

/**
 * Initialize the database connection pool
 */
const initializePool = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
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

module.exports = {
  initializePool,
  getPool,
  query
};