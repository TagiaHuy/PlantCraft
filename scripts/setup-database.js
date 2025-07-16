#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script will:
 * 1. Create the database if it doesn't exist
 * 2. Create all tables from database.sql
 * 3. Insert initial data if needed
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const setupDatabase = async () => {
  let tempPool = null;
  let mainPool = null;

  try {
    console.log('🚀 Starting database setup...');

    // Step 1: Connect to MySQL server (without specifying database)
    tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    console.log('✅ Connected to MySQL server');

    // Step 2: Create database if not exists
    const dbName = process.env.DB_NAME || 'plantcraft_db';
    await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' is ready`);

    // Step 3: Close temp pool and create main pool with database
    await tempPool.end();
    
    mainPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log('✅ Connected to database');

    // Step 4: Read and execute SQL file
    const sqlFilePath = path.join(__dirname, '../database.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim());
      // .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    console.log(sqlContent);
    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    // Separate CREATE TABLE and CREATE INDEX statements
    const createTableStatements = [];
    const createIndexStatements = [];
    const otherStatements = [];

    for (const statement of statements) {
      const upperStatement = statement.toUpperCase();
      if (upperStatement.includes('CREATE TABLE')) {
        createTableStatements.push(statement);
      } else if (upperStatement.includes('CREATE INDEX')) {
        createIndexStatements.push(statement);
      } else if (statement.length > 0) {
        otherStatements.push(statement);
      }
    }

    console.log(`📋 Found ${createTableStatements.length} CREATE TABLE statements`);
    console.log(`📋 Found ${createIndexStatements.length} CREATE INDEX statements`);

    // Execute CREATE TABLE statements first
    console.log('\n🔨 Creating tables...');
    for (let i = 0; i < createTableStatements.length; i++) {
      const statement = createTableStatements[i];
      try {
        await mainPool.execute(statement);
        successCount++;
        console.log(`✅ Created table ${i + 1}/${createTableStatements.length}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Table ${i + 1} already exists`);
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ Error creating table ${i + 1}:`, error.message);
        }
      }
    }

    // Execute CREATE INDEX statements after tables are created
    console.log('\n🔍 Creating indexes...');
    for (let i = 0; i < createIndexStatements.length; i++) {
      const statement = createIndexStatements[i];
      try {
        await mainPool.execute(statement);
        successCount++;
        console.log(`✅ Created index ${i + 1}/${createIndexStatements.length}`);
      } catch (error) {
        if (error.message.includes('already exists') || 
            error.message.includes('Duplicate key name')) {
          console.log(`⚠️  Index ${i + 1} already exists`);
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ Error creating index ${i + 1}:`, error.message);
        }
      }
    }

    // Execute other statements (INSERT, etc.)
    console.log('\n📝 Executing other SQL statements (INSERT, etc.)...');
    for (let i = 0; i < otherStatements.length; i++) {
      const statement = otherStatements[i];
      if (!statement) continue;
      console.log(`🟢 Executing [${i + 1}/${otherStatements.length}]: ${statement}`);
      try {
        await mainPool.execute(statement);
        successCount++;
        console.log(`✅ Executed statement ${i + 1}/${otherStatements.length}`);
      } catch (error) {
        if (error.message.includes('Duplicate entry') || error.message.includes('already exists')) {
          console.log(`⚠️  Statement ${i + 1} already executed or duplicate`);
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error(`   SQL: ${statement}`);
        }
      }
    }

    console.log(`\n📊 Setup Summary:`);
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📝 Total statements: ${statements.length}`);

    // Step 5: Verify tables were created
    const [tables] = await mainPool.execute('SHOW TABLES');
    console.log('\n📋 Created tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    // Step 6: Verify indexes were created
    console.log('\n🔍 Created indexes:');
    for (const tableName of ['users', 'pending_registrations', 'active_sessions', 'user_update_history']) {
      try {
        const [indexes] = await mainPool.execute(`SHOW INDEX FROM ${tableName}`);
        indexes.forEach(index => {
          if (index.Key_name !== 'PRIMARY') {
            console.log(`  - ${tableName}.${index.Key_name}`);
          }
        });
      } catch (error) {
        // Table might not exist, skip
      }
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('You can now start your application.');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up connections
    try {
      if (tempPool) {
        await tempPool.end();
      }
    } catch (error) {
      console.warn('Warning: Error closing temp pool:', error.message);
    }
    
    try {
      if (mainPool) {
        await mainPool.end();
      }
    } catch (error) {
      console.warn('Warning: Error closing main pool:', error.message);
    }
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('\n✨ Setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase; 