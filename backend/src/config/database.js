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

const pool = mysql.createPool(dbConfig);

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL database connected successfully");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

module.exports = { pool, connectDB };
