#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests connectivity to the MySQL database
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');

  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  console.log('📋 Connection config:');
  console.log(`  Host: ${config.host}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  Password: ${config.password ? '***' : 'NOT SET'}`);

  let connection;

  try {
    console.log('\n🔄 Attempting to connect...');
    connection = await mysql.createConnection(config);

    console.log('✅ Successfully connected to database!');

    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Query test successful:', rows[0]);

    // Check if the database exists and has tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Database has ${tables.length} tables`);

    if (tables.length > 0) {
      console.log('📋 Tables found:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });
    } else {
      console.log('📝 No tables found. This is normal for a fresh database.');
    }

    console.log('\n🎉 Database connection test completed successfully!');
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check if the database server is running');
      console.error('   2. Verify the host and port are correct');
      console.error('   3. Ensure firewall/security group allows connections');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check username and password');
      console.error('   2. Verify user has access to the database');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Possible solutions:');
      console.error(
        '   1. Database does not exist - it will be created during setup'
      );
      console.error('   2. Check database name in environment variables');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check network connectivity');
      console.error(
        '   2. Verify security group allows outbound traffic to port 3306'
      );
      console.error('   3. Check if RDS instance is running and accessible');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
