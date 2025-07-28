const mysql = require('mysql2/promise');
const { getConfig } = require('./environment');

// Get validated environment configuration
const config = getConfig();

// Debug: Log all SSL-related environment variables
console.log('=== SSL Environment Variables Debug ===');
console.log('DB_SSL_CA:', process.env.DB_SSL_CA);
console.log('DB_SSL_MODE:', process.env.DB_SSL_MODE);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=====================================');

// TEMPORARILY DISABLE SSL FOR TESTING
console.log('SSL temporarily disabled for testing basic connection');
const sslConfig = null;

// SSL Configuration - use environment variables if available, fallback to hardcoded path
// DISABLED FOR TESTING
/*
if (process.env.DB_SSL_CA && process.env.DB_SSL_MODE) {
  console.log('Using SSL configuration from environment variables');
  console.log('SSL CA path:', process.env.DB_SSL_CA);
  console.log('SSL mode:', process.env.DB_SSL_MODE);
 
  try {
    // Check if the certificate file exists
    if (fs.existsSync(process.env.DB_SSL_CA)) {
      sslConfig = {
        rejectUnauthorized: process.env.DB_SSL_MODE === 'VERIFY_IDENTITY',
        ca: fs.readFileSync(process.env.DB_SSL_CA),
      };
      console.log('SSL certificate loaded successfully from environment path');
    } else {
      console.warn('SSL certificate file not found at:', process.env.DB_SSL_CA);
    }
  } catch (error) {
    console.error(
      'Error loading SSL certificate from environment path:',
      error.message
    );
  }
}

// Fallback to hardcoded path if environment variables are not set or certificate not found
if (!sslConfig) {
  const certificatePath = path.join(__dirname, '../../rds-ca-2019-root.pem');
  console.log('Falling back to hardcoded certificate path:', certificatePath);
 
  try {
    if (fs.existsSync(certificatePath)) {
      sslConfig = {
        rejectUnauthorized: true,
        ca: fs.readFileSync(certificatePath),
      };
      console.log('SSL certificate loaded successfully from fallback path');
    } else {
      console.warn(
        'SSL certificate file not found at fallback path:',
        certificatePath
      );
    }
  } catch (error) {
    console.error(
      'Error loading SSL certificate from fallback path:',
      error.message
    );
  }
}
*/

// If no SSL config is available, log a warning but continue without SSL
if (!sslConfig) {
  console.log('SSL disabled for testing - proceeding without SSL verification');
}

const dbConfig = {
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: config.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL configuration for RDS - only add if sslConfig is available
  // ...(sslConfig && { ssl: sslConfig }),
  // Additional connection options for RDS
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
};

console.log('Database config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: 'disabled for testing',
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
