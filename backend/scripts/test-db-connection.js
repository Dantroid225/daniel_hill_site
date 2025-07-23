const { pool } = require('../src/config/database');

async function testConnection() {
  try {
    console.log('Testing database connection...');

    // Test basic connection
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    console.log('Test query result:', rows);

    // Test if database exists
    const [databases] = await pool.execute('SHOW DATABASES');
    console.log(
      'Available databases:',
      databases.map(db => db.Database)
    );

    // Test if our database exists
    const dbExists = databases.some(db => db.Database === 'dh_portfolio');
    if (dbExists) {
      console.log('✅ dh_portfolio database exists');

      // Test if tables exist
      await pool.execute('USE dh_portfolio');
      const [tables] = await pool.execute('SHOW TABLES');
      console.log(
        'Tables in dh_portfolio:',
        tables.map(table => Object.values(table)[0])
      );
    } else {
      console.log('❌ dh_portfolio database does not exist');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testConnection();
