// Database service for handling MySQL connections and queries
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Create a connection pool instead of a single connection
// This is more efficient for handling multiple requests
let pool = null;

/**
 * Create database if not exists
 */
const createDatabaseIfNotExists = async () => {
  try {
    // Connect without specifying database
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    // Create database if not exists
    await tempPool.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database '${process.env.DB_NAME}' is ready`);
    
    await tempPool.end();
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
};

/**
 * Initialize database tables from SQL file
 */
const initializeTables = async () => {
  try {
    const sqlFilePath = path.join(__dirname, '../../database.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Separate CREATE TABLE and CREATE INDEX statements
    const createTableStatements = [];
    const createIndexStatements = [];

    for (const statement of statements) {
      if (statement.toUpperCase().includes('CREATE TABLE')) {
        createTableStatements.push(statement);
      } else if (statement.toUpperCase().includes('CREATE INDEX')) {
        createIndexStatements.push(statement);
      }
    }

    // Execute CREATE TABLE statements first
    for (const statement of createTableStatements) {
      try {
        await pool.execute(statement);
        console.log('Executed CREATE TABLE statement successfully');
      } catch (error) {
        // Ignore errors for statements that might already exist
        if (!error.message.includes('already exists')) {
          console.warn('CREATE TABLE statement execution warning:', error.message);
        }
      }
    }

    // Execute CREATE INDEX statements after tables are created
    for (const statement of createIndexStatements) {
      try {
        await pool.execute(statement);
        console.log('Executed CREATE INDEX statement successfully');
      } catch (error) {
        // Ignore errors for statements that might already exist
        if (!error.message.includes('already exists') && !error.message.includes('Duplicate key name')) {
          console.warn('CREATE INDEX statement execution warning:', error.message);
        }
      }
    }
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  }
};

/**
 * Initialize the database connection pool
 */
const initializePool = async () => {
  try {
    // Ensure pool is only created once
    if (pool) return pool;

    // First, create database if not exists
    await createDatabaseIfNotExists();

    // Then create connection pool with the database
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10, // Max number of connections
      queueLimit: 0,       // Unlimited queue limit
    });

    console.log('Database connection pool initialized');

    // Initialize tables
    await initializeTables();

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
 * Check if database is connected
 * @returns {Promise<boolean>} True if connected
 */
const isConnected = async () => {
  try {
    await getPool().execute('SELECT 1');
    return true;
  } catch (error) {
    return false;
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
  closePool,
  isConnected
};
