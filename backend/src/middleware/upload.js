const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

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
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed!"));
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

// Middleware to process and optimize uploaded images
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const optimizedPath = filePath.replace(/\.[^/.]+$/, "_optimized.jpg");

    // Process image with Sharp
    await sharp(filePath)
      .resize(1200, 800, {
        fit: "inside",
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
    console.error("Image processing error:", error);
    // If processing fails, continue with original file
    next();
  }
};

// Error handling middleware for upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Only one file allowed.",
      });
    }
  }

  if (error.message.includes("Only image files")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};

module.exports = { upload, processImage, handleUploadError };
