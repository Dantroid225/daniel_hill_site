const { pool } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function setupStoredProcedures() {
  try {
    console.log('Setting up stored procedures for MySQL 8.0.42...');

    // Read the MySQL 8.0.42 compatible stored procedures SQL file
    const sqlFilePath = path.join(
      __dirname,
      '../src/config/manual-setup-mysql8.sql'
    );
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the entire file as one query to handle DELIMITER statements properly
    try {
      await pool.query(sqlContent);
      console.log('✅ Stored procedures setup completed successfully!');
    } catch (error) {
      console.error('❌ Error setting up stored procedures:', error.message);

      // Try alternative approach - execute statements one by one with better parsing
      console.log('🔄 Trying alternative setup approach...');
      await setupStoredProceduresAlternative(sqlContent);
    }

    console.log('✅ Stored procedures setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up stored procedures:', error);
    process.exit(1);
  }
}

async function setupStoredProceduresAlternative(sqlContent) {
  // Remove comments and clean up the SQL
  const cleanSQL = sqlContent
    .replace(/--.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .trim();

  // Split by DELIMITER statements and handle each section
  const sections = cleanSQL.split('DELIMITER');

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (section && !section.startsWith('$$')) {
      try {
        await pool.query(section);
        console.log(`✅ Executed section ${i + 1}`);
      } catch (error) {
        console.error(`❌ Error executing section ${i + 1}:`, error.message);
      }
    }
  }
}

setupStoredProcedures();
