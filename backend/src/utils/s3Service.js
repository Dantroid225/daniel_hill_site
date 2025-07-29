const AWS = require('aws-sdk');
const { getConfig } = require('../config/environment');

// Configure AWS
const config = getConfig();
AWS.config.update({
  region: config.AWS_REGION || 'us-east-1',
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const BUCKET_NAME = config.S3_BUCKET_NAME || 'dh-portfolio-assets';

class S3Service {
  /**
   * Upload a file to S3
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Name of the file
   * @param {string} contentType - MIME type of the file
   * @param {string} folder - Folder path in S3 (optional)
   * @returns {Promise<Object>} Upload result with URL
   */
  static async uploadFile(
    fileBuffer,
    fileName,
    contentType,
    folder = 'images'
  ) {
    try {
      const key = folder ? `${folder}/${fileName}` : fileName;

      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read',
        CacheControl: 'max-age=31536000', // 1 year cache
      };

      const result = await s3.upload(uploadParams).promise();

      console.log(`File uploaded successfully to S3: ${result.Location}`);

      return {
        success: true,
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} Success status
   */
  static async deleteFile(key) {
    try {
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Key: key,
      };

      await s3.deleteObject(deleteParams).promise();
      console.log(`File deleted successfully from S3: ${key}`);

      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Get the S3 URL for a file
   * @param {string} key - S3 object key
   * @returns {string} Full S3 URL
   */
  static getFileUrl(key) {
    return `https://${BUCKET_NAME}.s3.${
      config.AWS_REGION || 'us-east-1'
    }.amazonaws.com/${key}`;
  }

  /**
   * Get CloudFront URL for a file (if CloudFront is configured)
   * @param {string} key - S3 object key
   * @returns {string} CloudFront URL or S3 URL as fallback
   */
  static getCloudFrontUrl(key) {
    const cloudfrontDomain = config.CLOUDFRONT_DOMAIN;
    if (cloudfrontDomain) {
      return `https://${cloudfrontDomain}/${key}`;
    }
    return this.getFileUrl(key);
  }

  /**
   * Check if a file exists in S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} Whether file exists
   */
  static async fileExists(key) {
    try {
      await s3
        .headObject({
          Bucket: BUCKET_NAME,
          Key: key,
        })
        .promise();
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * List files in a folder
   * @param {string} folder - Folder path (optional)
   * @returns {Promise<Array>} List of file objects
   */
  static async listFiles(folder = '') {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Prefix: folder,
      };

      const result = await s3.listObjectsV2(params).promise();
      return result.Contents || [];
    } catch (error) {
      console.error('Error listing files from S3:', error);
      throw new Error(`Failed to list files from S3: ${error.message}`);
    }
  }
}

module.exports = S3Service;
