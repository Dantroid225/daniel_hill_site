const AWS = require('aws-sdk');
const { getConfig } = require('./environment');

const config = getConfig();

const cloudwatch = new AWS.CloudWatch({
  region: config.AWS_REGION,
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
