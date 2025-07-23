const { pool } = require('../src/config/database');

async function testArtShow() {
  try {
    console.log('Testing Art Show functionality...');

    // Test 1: Check if GetPortfolioItemsByCategory procedure exists
    console.log('\n1. Testing stored procedure...');
    try {
      const [procedures] = await pool.execute(
        "SHOW PROCEDURE STATUS WHERE Name = 'GetPortfolioItemsByCategory'"
      );

      if (procedures.length > 0) {
        console.log('✅ GetPortfolioItemsByCategory procedure exists');
      } else {
        console.log('❌ GetPortfolioItemsByCategory procedure not found');
        return;
      }
    } catch (error) {
      console.error('❌ Error checking procedure:', error.message);
      return;
    }

    // Test 2: Call the procedure to get art projects
    console.log('\n2. Testing art projects retrieval...');
    try {
      const [artProjects] = await pool.execute(
        'CALL GetPortfolioItemsByCategory(?)',
        ['art']
      );

      console.log(`✅ Found ${artProjects[0].length} art projects`);

      if (artProjects[0].length > 0) {
        console.log('Sample art project:');
        console.log(`  Title: ${artProjects[0][0].title}`);
        console.log(`  Category: ${artProjects[0][0].category}`);
        console.log(`  Status: ${artProjects[0][0].status}`);
      } else {
        console.log(
          'ℹ️  No art projects found - you may need to run: npm run setup-art'
        );
      }
    } catch (error) {
      console.error('❌ Error retrieving art projects:', error.message);
    }

    // Test 3: Check if art projects exist in database
    console.log('\n3. Checking database for art projects...');
    try {
      const [allProjects] = await pool.execute(
        "SELECT COUNT(*) as count FROM portfolio_items WHERE category = 'art'"
      );

      console.log(`✅ Found ${allProjects[0].count} art projects in database`);

      if (allProjects[0].count === 0) {
        console.log('ℹ️  No art projects in database - run: npm run setup-art');
      }
    } catch (error) {
      console.error('❌ Error checking database:', error.message);
    }

    console.log('\n✅ Art Show functionality test completed!');
  } catch (error) {
    console.error('❌ Error testing Art Show:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testArtShow();
