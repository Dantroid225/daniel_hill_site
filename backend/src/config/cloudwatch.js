const AWS = require('aws-sdk');

const cloudwatch = new AWS.CloudWatch({
  region: process.env.AWS_REGION || 'us-east-1',
});

const logMetric = async (metricName, value, unit = 'Count') => {
  try {
    await cloudwatch
      .putMetricData({
        Namespace: 'dh-portfolio/Application',
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Timestamp: new Date(),
          },
        ],
      })
      .promise();
  } catch (error) {
    console.error('Error logging metric:', error);
  }
};

module.exports = { logMetric };
