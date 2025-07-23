const request = require('supertest');
const app = require('../../src/server');
const { pool } = require('../../src/config/database');

describe('Contact API', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/contact', () => {
    it('should create a new contact message', async () => {
      const messageData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      };

      const response = await request(app)
        .post('/api/contact')
        .send(messageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(messageData.name);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});
