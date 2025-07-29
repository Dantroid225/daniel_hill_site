const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../src/config/environment');
const S3Service = require('../src/utils/s3Service');

const config = getConfig();

async function migrateImagesToS3() {
  const connection = await mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    port: config.DB_PORT,
  });

  try {
    console.log('Starting image migration to S3...');

    // Check if AWS credentials are configured
    if (!config.AWS_ACCESS_KEY_ID || !config.AWS_SECRET_ACCESS_KEY) {
      console.error(
        'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.'
      );
      process.exit(1);
    }

    // Get all portfolio items with local image URLs
    const [items] = await connection.execute(
      'SELECT id, title, image_url FROM portfolio_items WHERE image_url IS NOT NULL AND image_url LIKE "/uploads/%"'
    );

    console.log(`Found ${items.length} items with local image URLs to migrate`);

    for (const item of items) {
      try {
        console.log(`Processing item ${item.id}: ${item.title}`);

        // Check if local file exists
        const localPath = path.join(__dirname, '..', item.image_url);
        if (!fs.existsSync(localPath)) {
          console.warn(`Local file not found: ${localPath}`);
          continue;
        }

        // Read file
        const fileBuffer = fs.readFileSync(localPath);
        const fileName = path.basename(item.image_url);
        const contentType = getContentType(fileName);

        // Upload to S3
        console.log(`Uploading ${fileName} to S3...`);
        const uploadResult = await S3Service.uploadFile(
          fileBuffer,
          fileName,
          contentType,
          'images'
        );

        // Update database with new URL
        const newUrl = S3Service.getCloudFrontUrl(uploadResult.key);
        await connection.execute(
          'UPDATE portfolio_items SET image_url = ? WHERE id = ?',
          [newUrl, item.id]
        );

        console.log(`Successfully migrated item ${item.id}: ${newUrl}`);

        // Optionally, delete local file after successful migration
        // Uncomment the next line if you want to remove local files after migration
        // fs.unlinkSync(localPath);
      } catch (error) {
        console.error(`Error migrating item ${item.id}:`, error.message);
      }
    }

    console.log('Image migration completed!');

    // Show migration summary
    const [migratedItems] = await connection.execute(
      'SELECT COUNT(*) as count FROM portfolio_items WHERE image_url LIKE "https://%"'
    );
    console.log(`Total items with S3 URLs: ${migratedItems[0].count}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateImagesToS3()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateImagesToS3 };
