const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function setupAdmin() {
  let connection;

  try {
    console.log("Setting up admin user...");

    // Create connection without specifying database first
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "admin",
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    connection = await mysql.createConnection(dbConfig);

    // Create database if it doesn't exist
    console.log("Creating database if it doesn't exist...");
    await connection.query("CREATE DATABASE IF NOT EXISTS dh_portfolio");

    // Use the database
    await connection.query("USE dh_portfolio");

    // Create tables
    console.log("Creating tables...");

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Portfolio items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        project_url VARCHAR(500),
        technologies JSON,
        category VARCHAR(100),
        display_order INT DEFAULT 0,
        status ENUM('draft', 'published', 'archived') DEFAULT 'published',
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Contact inquiries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    console.log("Creating indexes...");
    try {
      await connection.query(
        "CREATE INDEX idx_portfolio_order ON portfolio_items(display_order, status)"
      );
    } catch (error) {
      if (!error.message.includes("Duplicate key name")) {
        console.warn(`Warning creating portfolio index: ${error.message}`);
      }
    }

    try {
      await connection.query("CREATE INDEX idx_users_role ON users(role)");
    } catch (error) {
      if (!error.message.includes("Duplicate key name")) {
        console.warn(`Warning creating users role index: ${error.message}`);
      }
    }

    try {
      await connection.query("CREATE INDEX idx_users_email ON users(email)");
    } catch (error) {
      if (!error.message.includes("Duplicate key name")) {
        console.warn(`Warning creating users email index: ${error.message}`);
      }
    }

    // Insert sample portfolio data
    console.log("Inserting sample data...");
    try {
      await connection.query(`
        INSERT INTO portfolio_items (title, description, image_url, project_url, technologies, category, display_order) VALUES
        ('Sample Project 1', 'A sample portfolio project description', '/uploads/images/project1.jpg', 'https://github.com/sample/project1', '["React", "Node.js", "MySQL"]', 'Web Development', 1),
        ('Sample Project 2', 'Another sample portfolio project', '/uploads/images/project2.jpg', 'https://github.com/sample/project2', '["Vue.js", "Express", "MongoDB"]', 'Full Stack', 2)
      `);
    } catch (error) {
      if (!error.message.includes("Duplicate entry")) {
        console.warn(`Warning inserting sample data: ${error.message}`);
      }
    }

    // Check if admin user already exists
    const [existingAdmins] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND role = "admin"',
      ["admin@danielhill.dev"]
    );

    if (existingAdmins.length === 0) {
      // Create admin user with secure password
      const adminPassword = "admin123"; // Default password - should be changed immediately
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      await connection.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Admin User", "admin@danielhill.dev", hashedPassword, "admin"]
      );

      console.log("✅ Admin user created successfully!");
      console.log("📧 Email: admin@danielhill.dev");
      console.log("🔑 Password: admin123");
      console.log(
        "⚠️  IMPORTANT: Change this password immediately after first login!"
      );
    } else {
      console.log("✅ Admin user already exists");
    }

    console.log("🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up admin:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupAdmin();
