const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { getConfig } = require('../src/config/environment');

const config = getConfig();

// Function to display usage information
function showUsage() {
  console.log('Usage: node setup-admin.js <name> <email> <password>');
  console.log('');
  console.log('Arguments:');
  console.log('  name     - Full name of the admin user');
  console.log('  email    - Email address for the admin user');
  console.log('  password - Password for the admin user (min 6 characters)');
  console.log('');
  console.log('Example:');
  console.log(
    '  node setup-admin.js "John Doe" "admin@example.com" "securepassword123"'
  );
  process.exit(1);
}

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate password strength
function isValidPassword(password) {
  return password && password.length >= 6;
}

async function setupAdmin() {
  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.length !== 3) {
    console.error('❌ Error: Incorrect number of arguments');
    showUsage();
  }

  const [name, email, password] = args;

  // Validate arguments
  if (!name || name.trim() === '') {
    console.error('❌ Error: Name is required');
    showUsage();
  }

  if (!isValidEmail(email)) {
    console.error('❌ Error: Invalid email format');
    showUsage();
  }

  if (!isValidPassword(password)) {
    console.error('❌ Error: Password must be at least 6 characters long');
    showUsage();
  }

  let connection;

  try {
    console.log('Setting up admin user...');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);

    // Create connection without specifying database first
    const dbConfig = {
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      port: config.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    connection = await mysql.createConnection(dbConfig);

    // Create database if it doesn't exist
    console.log("Creating database if it doesn't exist...");
    await connection.query('CREATE DATABASE IF NOT EXISTS dh_portfolio');

    // Use the database
    await connection.query('USE dh_portfolio');

    // Create tables
    console.log('Creating tables...');

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
    console.log('Creating indexes...');
    try {
      await connection.query(
        'CREATE INDEX idx_portfolio_order ON portfolio_items(display_order, status)'
      );
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.warn(`Warning creating portfolio index: ${error.message}`);
      }
    }

    try {
      await connection.query('CREATE INDEX idx_users_role ON users(role)');
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.warn(`Warning creating users role index: ${error.message}`);
      }
    }

    try {
      await connection.query('CREATE INDEX idx_users_email ON users(email)');
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.warn(`Warning creating users email index: ${error.message}`);
      }
    }

    // Insert sample portfolio data
    console.log('Inserting sample data...');
    try {
      await connection.query(`
        INSERT INTO portfolio_items (title, description, image_url, project_url, technologies, category, display_order) VALUES
        ('Sample Project 1', 'A sample portfolio project description', '/uploads/images/project1.jpg', 'https://github.com/sample/project1', '["React", "Node.js", "MySQL"]', 'Web Development', 1),
        ('Sample Project 2', 'Another sample portfolio project', '/uploads/images/project2.jpg', 'https://github.com/sample/project2', '["Vue.js", "Express", "MongoDB"]', 'Full Stack', 2)
      `);
    } catch (error) {
      if (!error.message.includes('Duplicate entry')) {
        console.warn(`Warning inserting sample data: ${error.message}`);
      }
    }

    // Check if admin user already exists
    const [existingAdmins] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND role = "admin"',
      [email]
    );

    if (existingAdmins.length === 0) {
      // Create admin user with provided credentials
      const hashedPassword = await bcrypt.hash(password, 12);

      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'admin']
      );

      console.log('✅ Admin user created successfully!');
      console.log(`   Name: ${name}`);
      console.log(`   Email: ${email}`);
    } else {
      // Update existing admin user's password
      const hashedPassword = await bcrypt.hash(password, 12);

      await connection.execute(
        'UPDATE users SET password = ? WHERE email = ? AND role = "admin"',
        [hashedPassword, email]
      );

      console.log('✅ Admin user password updated successfully!');
      console.log(`   Name: ${name}`);
      console.log(`   Email: ${email}`);
    }

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupAdmin();
