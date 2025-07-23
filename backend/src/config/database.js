const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "dh_portfolio",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

console.log("Database config:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
});

const pool = mysql.createPool(dbConfig);

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL database connected successfully");

    // Check which database we're actually using
    const [rows] = await connection.query("SELECT DATABASE() as current_db");
    console.log("Current database:", rows[0].current_db);

    // Check if the users table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    console.log("Users table exists:", tables.length > 0);

    if (tables.length > 0) {
      // Check how many users are in the table
      const [userCount] = await connection.query(
        "SELECT COUNT(*) as count FROM users"
      );
      console.log("Total users in database:", userCount[0].count);

      // Check for admin users specifically
      const [adminCount] = await connection.query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
      );
      console.log("Admin users in database:", adminCount[0].count);
    }

    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

module.exports = { pool, connectDB };
