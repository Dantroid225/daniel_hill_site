const nodemailer = require('nodemailer');
const { validateEmail, sanitizeInput } = require('./validation');
const { getConfig } = require('../config/environment');

const config = getConfig();

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  // Initialize email transporter
  async initialize() {
    try {
      // Check if email configuration is available
      if (!config.EMAIL_HOST || !config.EMAIL_USER || !config.EMAIL_PASSWORD) {
        console.warn(
          'Email configuration not available - email service will be disabled'
        );
        this.isConfigured = false;
        return;
      }

      // Exchange configuration
      this.transporter = nodemailer.createTransport({
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASSWORD,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.isConfigured = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  // Send contact form email
  async sendContactEmail(contactData) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    // Validate and sanitize input
    const { name, email, subject, message } = contactData;

    if (!validateEmail(email)) {
      throw new Error('Invalid email address');
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedSubject = sanitizeInput(subject);
    const sanitizedMessage = sanitizeInput(message);

    if (!sanitizedName || !sanitizedSubject || !sanitizedMessage) {
      throw new Error('Missing required fields');
    }

    const mailOptions = {
      from: config.EMAIL_USER,
      to: config.CONTACT_EMAIL || config.EMAIL_USER,
      replyTo: email,
      subject: `Portfolio Contact: ${sanitizedSubject}`,
      html: this.generateContactEmailHTML({
        name: sanitizedName,
        email,
        subject: sanitizedSubject,
        message: sanitizedMessage,
      }),
      text: this.generateContactEmailText({
        name: sanitizedName,
        email,
        subject: sanitizedSubject,
        message: sanitizedMessage,
      }),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Contact email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Failed to send contact email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Send confirmation email to user
  async sendConfirmationEmail(userEmail, userName) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    if (!validateEmail(userEmail)) {
      throw new Error('Invalid email address');
    }

    const mailOptions = {
      from: config.EMAIL_USER,
      to: userEmail,
      subject: 'Thank you for contacting Daniel Hill',
      html: this.generateConfirmationEmailHTML(userName),
      text: this.generateConfirmationEmailText(userName),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Confirmation email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      throw new Error('Failed to send confirmation email');
    }
  }

  // Generate HTML template for contact emails
  generateContactEmailHTML({ name, email, subject, message }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #495057; }
          .value { margin-top: 5px; }
          .message-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>A new message has been submitted through your portfolio website.</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${email}</div>
            </div>
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate text template for contact emails
  generateContactEmailText({ name, email, subject, message }) {
    return `
New Contact Form Submission

A new message has been submitted through your portfolio website.

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from your portfolio contact form.
    `;
  }

  // Generate HTML template for confirmation emails
  generateConfirmationEmailHTML(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Thank you for contacting Daniel Hill</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank you for reaching out!</h2>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>Thank you for contacting me through my portfolio website. I have received your message and will get back to you as soon as possible.</p>
            <p>In the meantime, feel free to explore my portfolio to learn more about my work and experience.</p>
            <p>Best regards,<br>Daniel Hill</p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate text template for confirmation emails
  generateConfirmationEmailText(userName) {
    return `
Thank you for reaching out!

Dear ${userName},

Thank you for contacting me through my portfolio website. I have received your message and will get back to you as soon as possible.

In the meantime, feel free to explore my portfolio to learn more about my work and experience.

Best regards,
Daniel Hill

---
This is an automated confirmation email. Please do not reply to this message.
    `;
  }

  // Check if email service is ready
  isReady() {
    return this.isConfigured && this.transporter !== null;
  }

  // Get service status
  getStatus() {
    return {
      configured: this.isConfigured,
      ready: this.isReady(),
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
