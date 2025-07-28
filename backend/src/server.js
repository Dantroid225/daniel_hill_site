const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import and validate environment configuration
const { getConfig } = require('./config/environment');
const config = getConfig();

const apiRoutes = require('./routes/api');
const { connectDB } = require('./config/database');
const emailService = require('./utils/emailService');

const app = express();
const PORT = config.PORT;

// Session configuration
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true, // Changed to true to ensure session is saved
    saveUninitialized: true, // Changed to true to save new sessions
    cookie: {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
    },
    name: 'sessionId', // Change default session cookie name
  })
);

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

// Helmet configuration with enhanced security
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
};

// In development, we might want to be more permissive
if (config.NODE_ENV === 'development') {
  helmetConfig.contentSecurityPolicy = false; // Disable CSP in development for easier debugging
}

app.use(helmet(helmetConfig));

// CORS configuration - Fixed to be more secure
const corsOptions = {
  origin: function (origin, callback) {
    // In production, reject requests with no origin
    if (config.NODE_ENV === 'production' && !origin) {
      return callback(new Error('Not allowed by CORS - no origin'));
    }

    const allowedOrigins =
      config.NODE_ENV === 'production'
        ? config.ALLOWED_ORIGINS?.split(',') || []
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'http://localhost:4173', // Vite preview
            'http://127.0.0.1:4173',
          ];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter);
app.use('/api/admin', authLimiter);

// Static files with CORS headers
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  },
  express.static(path.join(__dirname, '../uploads'))
);

app.use(
  '/uploads/archived',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  },
  express.static(path.join(__dirname, '../uploads/archived'))
);

// Test route to verify server is working
app.get('/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api', apiRoutes);

// Health check route
const healthRoutes = require('./routes/health');
app.use('/', healthRoutes);

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('Error:', err.message);
  // Don't expose stack traces in production
  if (config.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Something went wrong!' });
  } else {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Start server with database retry logic
const startServer = async () => {
  let dbConnected = false;
  let retryCount = 0;
  const maxRetries = 10;
  const retryDelay = 5000; // 5 seconds

  // Function to attempt database connection
  const attemptDBConnection = async () => {
    try {
      await connectDB();
      dbConnected = true;
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.error(
        `❌ Database connection attempt ${retryCount + 1} failed:`,
        error.message
      );
      return false;
    }
  };

  // Start the server even if database connection fails
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Test endpoint: http://localhost:${PORT}/test`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base: http://localhost:${PORT}/api`);

    if (!dbConnected) {
      console.log(
        '⚠️  Server started without database connection - will retry in background'
      );
    }
  });

  // Try to connect to database with retries
  while (!dbConnected && retryCount < maxRetries) {
    if (await attemptDBConnection()) {
      break;
    }
    retryCount++;
    if (retryCount < maxRetries) {
      console.log(
        `⏳ Retrying database connection in ${
          retryDelay / 1000
        } seconds... (${retryCount}/${maxRetries})`
      );
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  if (!dbConnected) {
    console.log(
      '⚠️  Server running without database connection. Database-dependent features will not work.'
    );
    console.log('💡 Check database configuration and network connectivity.');
  } else {
    // Initialize email service only if database is connected
    try {
      await emailService.initialize();
      console.log(`📧 Email service status:`, emailService.getStatus());
    } catch (error) {
      console.error('⚠️  Email service initialization failed:', error.message);
    }
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
};

startServer();
