const mysql = require('mysql2/promise');
const { getConfig } = require('./environment');
const fs = require('fs');

const config = getConfig();

// Function to check if SSL certificate exists and configure SSL
const getSSLConfig = () => {
  // If DB_SSL_CA is explicitly set, use that file
  if (config.DB_SSL_CA && fs.existsSync(config.DB_SSL_CA)) {
    console.log(`SSL certificate found at: ${config.DB_SSL_CA}`);
    return {
      ssl: {
        ca: fs.readFileSync(config.DB_SSL_CA),
        rejectUnauthorized: true,
      },
    };
  }

  // Use the system's certificate store (copied from EC2 during build)
  console.log('Using EC2 certificate store (copied during build)');
  return {
    ssl: {
      rejectUnauthorized: true,
    },
  };
};

const dbConfig = {
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: config.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Configure SSL based on certificate availability
  ...getSSLConfig(),
  // Connection timeout (MySQL2 compatible)
  connectTimeout: 60000,
};

console.log('Database config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: dbConfig.ssl ? 'enabled with system certificates' : 'disabled',
  sslCertPath: config.DB_SSL_CA || 'system certificate store',
});

const pool = mysql.createPool(dbConfig);

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL database connected successfully');

    // Check which database we're actually using
    const [rows] = await connection.query('SELECT DATABASE() as current_db');
    console.log('Current database:', rows[0].current_db);

    // Check if the users table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    console.log('Users table exists:', tables.length > 0);

    if (tables.length > 0) {
      // Check how many users are in the table
      const [userCount] = await connection.query(
        'SELECT COUNT(*) as count FROM users'
      );
      console.log('Total users in database:', userCount[0].count);

      // Check for admin users specifically
      const [adminCount] = await connection.query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
      );
      console.log('Admin users in database:', adminCount[0].count);
    }

    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

module.exports = { pool, connectDB };
