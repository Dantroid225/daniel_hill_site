#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function testRDSConnection() {
  console.log('🔍 Testing RDS connection without SSL...');

  const config = {
    host:
      process.env.DB_HOST || 'dhsite.cmfum4mqgoci.us-east-1.rds.amazonaws.com',
    user: process.env.DB_USER || 'fradmin',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'dhsite',
    // Explicitly disable SSL
    ssl: false,
    // Connection timeouts
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
  };

  console.log('📋 Connection config:');
  console.log(`  Host: ${config.host}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  SSL: ${config.ssl ? 'enabled' : 'disabled'}`);
  console.log(`  Password: ${config.password ? '***' : 'NOT SET'}`);

  let connection;

  try {
    console.log('\n🔄 Attempting to connect...');
    connection = await mysql.createConnection(config);

    console.log('✅ Successfully connected to RDS!');

    // Test a simple query
    const [rows] = await connection.query(
      'SELECT 1 as test, NOW() as current_time'
    );
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

    console.log('\n🎉 RDS connection test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error number:', error.errno);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 This is an access denied error. Possible causes:');
      console.log('  1. Wrong username/password');
      console.log('  2. User does not have access from this IP address');
      console.log(
        '  3. RDS security group does not allow connections from this IP'
      );
      console.log('  4. User does not exist in the database');
    }

    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testRDSConnection()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch(_error => {
    console.log('\n❌ Test failed');
    process.exit(1);
  });
