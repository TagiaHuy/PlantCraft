#!/usr/bin/env node

/**
 * Test Database Connection Script
 * 
 * This script tests the database connection and shows connection status
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const testConnection = async () => {
  let pool = null;

  try {
    console.log('🔍 Testing database connection...');
    console.log(`📋 Connection details:`);
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  User: ${process.env.DB_USER || 'root'}`);
    console.log(`  Database: ${process.env.DB_NAME || 'plantcraft_db'}`);
    console.log(`  Port: ${process.env.DB_PORT || 3306}`);

    // Test connection without database first
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    console.log('✅ Connected to MySQL server');

    // Check if database exists
    const [databases] = await pool.execute('SHOW DATABASES');
    const dbName = process.env.DB_NAME || 'plantcraft_db';
    const dbExists = databases.some(db => Object.values(db)[0] === dbName);

    if (dbExists) {
      console.log(`✅ Database '${dbName}' exists`);
      
      // Connect to the specific database
      await pool.end();
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: dbName,
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
      });

      // Check tables
      const [tables] = await pool.execute('SHOW TABLES');
      console.log(`📋 Found ${tables.length} tables:`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });

      // Test a simple query
      const [result] = await pool.execute('SELECT 1 as test');
      console.log('✅ Database query test successful');

    } else {
      console.log(`❌ Database '${dbName}' does not exist`);
      console.log('💡 Run "npm run setup-db" to create the database');
    }

    console.log('\n🎉 Database connection test completed successfully!');

  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure MySQL server is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Check your database credentials in .env file');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Check your DB_HOST in .env file');
    }
    
    process.exit(1);
  } finally {
    if (pool) await pool.end();
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('\n✨ Test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = testConnection; 