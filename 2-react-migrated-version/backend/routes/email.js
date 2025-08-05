const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { emailValidation } = require('../validation/emailValidation');

// @desc    Send custom email (Admin only)
// @route   POST /api/v1/email/send
// @access  Private/Admin
router.post('/send', adminOnly, validate(emailValidation.send), async (req, res) => {
  try {
    const { to, subject, content, language = 'en' } = req.body;

    if (!emailService.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Email service is not configured',
        error: 'SENDGRID_API_KEY not set'
      });
    }

    const result = await emailService.sendCustomEmail(to, subject, content, language);

    if (result.sent) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        data: {
          messageId: result.messageId,
          to,
          subject,
          sentAt: new Date().toISOString()
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Failed to send email',
        error: result.reason
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
});

// @desc    Get email service status
// @route   GET /api/v1/email/status
// @access  Private/Admin
router.get('/status', adminOnly, (req, res) => {
  try {
    const status = {
      configured: emailService.isReady(),
      provider: 'SendGrid',
      fromEmail: process.env.FROM_EMAIL || 'info@woodkits.com'
    };

    if (!status.configured) {
      status.message = 'Email service not configured. Set SENDGRID_API_KEY environment variable.';
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error checking email status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email status',
      error: error.message
    });
  }
});

// @desc    Test email service (Admin only)
// @route   POST /api/v1/email/test
// @access  Private/Admin
router.post('/test', adminOnly, validate(emailValidation.test), async (req, res) => {
  try {
    const { email } = req.body;

    if (!emailService.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Email service is not configured',
        error: 'SENDGRID_API_KEY not set'
      });
    }

    const testContent = {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0;">Wood Kits</h1>
            <p style="margin: 10px 0 0 0;">Email Service Test</p>
          </div>
          <div style="padding: 20px; margin: 20px 0;">
            <h2 style="color: #8B4513;">Test Email Successful! 🎉</h2>
            <p>This is a test email to verify that the Wood Kits email service is working correctly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Service:</strong> SendGrid</p>
          </div>
          <div style="text-align: center; color: #666; margin-top: 30px;">
            <p>Wood Kits Email Service</p>
          </div>
        </div>
      `,
      text: `
Wood Kits - Email Service Test

Test Email Successful!

This is a test email to verify that the Wood Kits email service is working correctly.

Timestamp: ${new Date().toISOString()}
Service: SendGrid

Wood Kits Email Service
      `
    };

    const result = await emailService.sendCustomEmail(
      email,
      'Wood Kits - Email Service Test',
      testContent
    );

    if (result.sent) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          messageId: result.messageId,
          to: email,
          sentAt: new Date().toISOString()
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Failed to send test email',
        error: result.reason
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

module.exports = router;