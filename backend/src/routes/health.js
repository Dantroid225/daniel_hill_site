const express = require('express');
const { pool } = require('../config/database');
const { logMetric } = require('../config/cloudwatch');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const connection = await pool.getConnection();
    connection.release();

    // Log health check
    await logMetric('HealthCheck', 1);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
    });
  } catch (error) {
    await logMetric('HealthCheckFailed', 1);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected',
    });
  }
});

module.exports = router;
