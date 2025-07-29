const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { validateFileUpload } = require('../utils/validation');
const S3Service = require('../utils/s3Service');
const { getConfig } = require('../config/environment');

const config = getConfig();

// Configure storage - using memory storage for S3 uploads
const storage = multer.memoryStorage();

// File filter for security
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Configure multer with security settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only allow 1 file per request
  },
  fileFilter: fileFilter,
});

// Middleware to process and upload images to S3
const processAndUploadImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Additional validation using our validation utilities
  const fileValidation = validateFileUpload(req.file);
  if (!fileValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'File validation failed',
      errors: fileValidation.errors,
    });
  }

  try {
    // Process image with Sharp
    const processedBuffer = await sharp(req.file.buffer)
      .resize(1200, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer();

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = req.file.fieldname + '-' + uniqueSuffix + '_optimized.jpg';

    // Upload to S3
    const uploadResult = await S3Service.uploadFile(
      processedBuffer,
      fileName,
      'image/jpeg',
      'images'
    );

    // Update req.file with S3 information
    req.file.filename = fileName;
    req.file.s3Key = uploadResult.key;
    req.file.s3Url = uploadResult.url;
    req.file.cloudfrontUrl = S3Service.getCloudFrontUrl(uploadResult.key);

    console.log(`Image processed and uploaded to S3: ${uploadResult.url}`);

    next();
  } catch (error) {
    console.error('Image processing/upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process and upload image',
      error: error.message,
    });
  }
};

// Legacy local storage middleware (for backward compatibility during migration)
const processImageLocal = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Additional validation using our validation utilities
  const fileValidation = validateFileUpload(req.file);
  if (!fileValidation.isValid) {
    // Remove the uploaded file if validation fails
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      success: false,
      message: 'File validation failed',
      errors: fileValidation.errors,
    });
  }

  try {
    const filePath = req.file.path;
    const optimizedPath = filePath.replace(/\.[^/.]+$/, '_optimized.jpg');

    // Process image with Sharp
    await sharp(filePath)
      .resize(1200, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toFile(optimizedPath);

    // Replace original file with optimized version
    fs.unlinkSync(filePath);
    req.file.path = optimizedPath;
    req.file.filename = path.basename(optimizedPath);

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    // If processing fails, continue with original file
    next();
  }
};

// Choose middleware based on configuration
const processImage =
  config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY
    ? processAndUploadImage
    : processImageLocal;

module.exports = {
  upload,
  processImage,
  processAndUploadImage,
  processImageLocal,
};
