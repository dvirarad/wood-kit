const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Initialize NodeMailer transporter with timeout configuration
const createTransporter = () => {
  // Support multiple email providers
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
  
  switch (emailProvider.toLowerCase()) {
    case 'gmail':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
        },
        // Add timeout configuration to prevent hanging
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,   // 10 seconds
        socketTimeout: 10000      // 10 seconds
      });
    
    case 'smtp':
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        // Add timeout configuration to prevent hanging
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,   // 10 seconds
        socketTimeout: 10000      // 10 seconds
      });
    
    default:
      // Default to Gmail
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        // Add timeout configuration to prevent hanging
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,   // 10 seconds
        socketTimeout: 10000      // 10 seconds
      });
  }
};

// @desc    Check email service configuration status
// @route   GET /api/v1/orders/email-status
// @access  Public (for debugging)
router.get('/email-status', async (req, res) => {
  try {
    const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
    const config = {
      provider: emailProvider,
      hasUser: !!process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD,
      fromEmail: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@woodkits.com',
      toEmail: process.env.EMAIL_TO || 'dvirarad@gmail.com'
    };

    // Add provider-specific config
    if (emailProvider === 'smtp') {
      config.smtpHost = process.env.SMTP_HOST;
      config.smtpPort = process.env.SMTP_PORT || 587;
      config.smtpSecure = process.env.SMTP_SECURE === 'true';
    }

    let status = 'healthy';
    let issues = [];
    let statusCode = 200;

    // Check for configuration issues
    if (!config.hasUser) {
      status = 'unhealthy';
      issues.push('EMAIL_USER not configured');
      statusCode = 503;
    }

    if (!config.hasPassword) {
      status = 'unhealthy';
      issues.push('EMAIL_PASSWORD not configured');
      statusCode = 503;
    }

    if (emailProvider === 'smtp' && !config.smtpHost) {
      status = 'unhealthy';
      issues.push('SMTP_HOST not configured for SMTP provider');
      statusCode = 503;
    }

    if (!config.fromEmail || config.fromEmail.includes('noreply@woodkits.com')) {
      status = 'warning';
      issues.push('Using default from email address');
    }

    const recommendations = [
      'Test email functionality using /api/v1/orders/test-email',
      'For Gmail: Use App Password instead of regular password',
      'Check environment variables: EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, EMAIL_TO'
    ];

    if (emailProvider === 'smtp') {
      recommendations.push('For SMTP: Configure SMTP_HOST, SMTP_PORT, SMTP_SECURE');
    }

    const response = {
      success: status === 'healthy',
      status: status,
      message: status === 'healthy' ? 'Email service ready' : 'Email service has issues',
      config: config,
      issues: issues,
      recommendations: recommendations
    };

    res.status(statusCode).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Failed to check email service status',
      error: error.message
    });
  }
});

// @desc    Test email sending functionality
// @route   POST /api/v1/orders/test-email
// @access  Public (for debugging)
router.post('/test-email', async (req, res) => {
  try {
    console.log('🧪 Testing email functionality with NodeMailer...');
    
    // Check environment variables
    const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
    const config = {
      provider: emailProvider,
      hasUser: !!process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD,
      fromEmail: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@woodkits.com',
      toEmail: process.env.EMAIL_TO || 'dvirarad@gmail.com'
    };
    
    console.log('📋 Email Configuration:', config);
    
    if (!config.hasUser) {
      return res.status(503).json({
        success: false,
        message: 'Email user not configured',
        config: config
      });
    }
    
    if (!config.hasPassword) {
      return res.status(503).json({
        success: false,
        message: 'Email password not configured',
        config: config
      });
    }
    
    // Create transporter
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    
    // Test email
    const testMessage = {
      from: config.fromEmail,
      to: config.toEmail,
      subject: '🧪 Wood Kits - NodeMailer Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">🧪 NodeMailer Test Successful!</h2>
          <p>This is a test email from Wood Kits backend using NodeMailer.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Provider: ${config.provider}</li>
            <li>Email User: ${config.hasUser ? '✅ Set' : '❌ Missing'}</li>
            <li>Email Password: ${config.hasPassword ? '✅ Set' : '❌ Missing'}</li>
            <li>From Email: ${config.fromEmail}</li>
            <li>To Email: ${config.toEmail}</li>
          </ul>
          <p>If you received this email, NodeMailer is working correctly! 🎉</p>
        </div>
      `
    };
    
    console.log('📧 Sending test email:', {
      to: testMessage.to,
      from: testMessage.from,
      subject: testMessage.subject
    });
    
    const result = await transporter.sendMail(testMessage);
    console.log('✅ Test email sent successfully!', result);
    
    res.json({
      success: true,
      message: 'Test email sent successfully via NodeMailer',
      config: config,
      sentTo: testMessage.to,
      messageId: result.messageId
    });
    
  } catch (error) {
    console.log('❌ NodeMailer test email failed:', error);
    
    let errorDetails = {
      message: error.message,
      code: error.code
    };
    
    let statusCode = 502; // Default service error
    let userMessage = 'NodeMailer email test failed';
    
    // Map NodeMailer errors to appropriate HTTP status codes
    if (error.code) {
      switch (error.code) {
        case 'EAUTH':
          statusCode = 502;
          userMessage = 'Email authentication failed - check EMAIL_USER and EMAIL_PASSWORD';
          break;
        case 'ECONNECTION':
          statusCode = 502;
          userMessage = 'Failed to connect to email service';
          break;
        case 'ETIMEDOUT':
          statusCode = 504;
          userMessage = 'Email service timeout';
          break;
        default:
          statusCode = 502;
          userMessage = 'Email service error';
      }
    }
    
    res.status(statusCode).json({
      success: false,
      message: userMessage,
      error: errorDetails,
      config: {
        provider: process.env.EMAIL_PROVIDER || 'gmail',
        hasUser: !!process.env.EMAIL_USER,
        hasPassword: !!process.env.EMAIL_PASSWORD,
        fromEmail: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@woodkits.com',
        toEmail: process.env.EMAIL_TO || 'dvirarad@gmail.com'
      }
    });
  }
});

// @desc    Submit new order
// @route   POST /api/v1/orders
// @access  Public
router.post('/', async (req, res) => {
  const startTime = Date.now();
  const logs = [];
  
  const log = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data || '');
    logs.push({ timestamp, message, data });
  };
  
  try {
    log('=== Order API Request Started ===');
    log('Request body received', { bodyKeys: Object.keys(req.body) });
    
    const {
      productId,
      productName,
      basePrice,
      configuration,
      calculatedPrice,
      deliveryFee,
      finalPrice,
      customer,
      orderDate,
      language
    } = req.body;

    log('Order data extracted', {
      productId,
      productName,
      customerEmail: customer?.email,
      finalPrice
    });

    // Validate required fields
    if (!productId || !productName || !customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      log('❌ Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required order information',
        logs
      });
    }

    log('✅ Validation passed');

    // Generate order ID
    const orderId = `WK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    log('Order ID generated', { orderId });

    // Create email templates
    const adminEmailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          🪵 הזמנה חדשה - Wood Kits
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #e74c3c; margin-top: 0;">מספר הזמנה: ${orderId}</h3>
          <p><strong>תאריך הזמנה:</strong> ${new Date(orderDate).toLocaleString('he-IL')}</p>
        </div>

        <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50;">פרטי המוצר</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>שם המוצר:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${productName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>קוד מוצר:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${productId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>מחיר בסיס:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">₪${basePrice.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>מחיר לאחר התאמות:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">₪${calculatedPrice.toLocaleString()}</td>
            </tr>
            ${deliveryFee > 0 ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>עלות משלוח:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">₪${deliveryFee.toLocaleString()}</td>
            </tr>` : ''}
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 8px; font-weight: bold; font-size: 18px;"><strong>סה"כ:</strong></td>
              <td style="padding: 8px; font-weight: bold; font-size: 18px; color: #e74c3c;">₪${finalPrice.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        ${configuration && configuration.dimensions ? `
        <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50;">מידות מותאמות</h3>
          <ul style="list-style: none; padding: 0;">
            ${Object.entries(configuration.dimensions).map(([key, value]) => 
              `<li style="padding: 5px 0; border-bottom: 1px solid #eee;">
                <strong>${key === 'width' ? 'רוחב' : key === 'height' ? 'גובה' : key === 'depth' ? 'עומק' : key === 'length' ? 'אורך' : key}:</strong> ${value} ס"מ
              </li>`
            ).join('')}
            ${configuration.color ? `<li style="padding: 5px 0;"><strong>צבע:</strong> ${configuration.color}</li>` : ''}
          </ul>
        </div>` : ''}

        <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50;">פרטי הלקוח</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>שם:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${customer.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>אימייל:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;" dir="ltr">${customer.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>טלפון:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;" dir="ltr">${customer.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>כתובת:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${customer.address}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>שיטת משלוח:</strong></td>
              <td style="padding: 8px;">
                <span style="background-color: ${customer.deliveryMethod === 'pickup' ? '#27ae60' : '#3498db'}; color: white; padding: 4px 8px; border-radius: 4px;">
                  ${customer.deliveryMethod === 'pickup' ? 'איסוף עצמי' : 'משלוח עד הבית'}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #2c3e50; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0;">הזמנה זו נשלחה באופן אוטומטי ממערכת Wood Kits</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">נא ליצור קשר עם הלקוח בהקדם</p>
        </div>
      </div>
    `;

    const customerEmailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          🪵 תודה על ההזמנה - Wood Kits
        </h2>
        
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #155724; margin-top: 0;">שלום ${customer.name},</h3>
          <p style="color: #155724; margin-bottom: 0;">ההזמנה שלך התקבלה בהצלחה! נחזור אליך תוך 24 שעות.</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #e74c3c; margin-top: 0;">מספר הזמנה: ${orderId}</h3>
          <p><strong>תאריך הזמנה:</strong> ${new Date(orderDate).toLocaleString('he-IL')}</p>
        </div>

        <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50;">סיכום ההזמנה</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>מוצר:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${productName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>מחיר:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">₪${calculatedPrice.toLocaleString()}</td>
            </tr>
            ${deliveryFee > 0 ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>משלוח:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">₪${deliveryFee.toLocaleString()}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>שיטת קבלה:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">
                ${customer.deliveryMethod === 'pickup' ? 'איסוף עצמי' : 'משלוח עד הבית'}
              </td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 8px; font-weight: bold; font-size: 18px;"><strong>סה"כ לתשלום:</strong></td>
              <td style="padding: 8px; font-weight: bold; font-size: 18px; color: #e74c3c;">₪${finalPrice.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">השלבים הבאים:</h3>
          <ul style="color: #856404;">
            <li>נחזור אליך תוך 24 שעות לאישור הפרטים</li>
            <li>נתאם איתך את זמני הייצור והאספקה</li>
            <li>התשלום יתבצע רק לאחר אישור סופי</li>
          </ul>
        </div>

        <div style="background-color: #2c3e50; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0;"><strong>Wood Kits - רהיטי עץ מותאמים אישית</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">תודה שבחרת בנו!</p>
        </div>
      </div>
    `;

    log('📧 Checking email configuration...');
    const emailConfig = {
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'MISSING',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'MISSING', 
      EMAIL_FROM: process.env.EMAIL_FROM || 'USING EMAIL_USER',
      EMAIL_TO: process.env.EMAIL_TO || 'USING DEFAULT',
      EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'gmail'
    };
    log('Email configuration status', emailConfig);

    // Send emails with NodeMailer with timeout wrapper
    try {
      log('🔧 Creating NodeMailer transporter...');
      const transporter = createTransporter();
      log('✅ Transporter created successfully');
      
      const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
      const toEmail = process.env.EMAIL_TO || 'dvirarad@gmail.com';
      
      log('📧 Email addresses configured', {
        fromEmail: fromEmail ? 'SET' : 'MISSING',
        toEmail: toEmail ? 'SET' : 'MISSING'
      });
      
      // Admin email
      const adminMessage = {
        from: fromEmail,
        to: toEmail,
        subject: `🪵 הזמנה חדשה #${orderId} - ${productName}`,
        html: adminEmailHtml
      };

      // Customer email  
      const customerMessage = {
        from: fromEmail,
        to: customer.email,
        subject: `תודה על ההזמנה - Wood Kits #${orderId}`,
        html: customerEmailHtml
      };

      log('📨 Email messages prepared', {
        adminTo: adminMessage.to,
        customerTo: customerMessage.to,
        from: adminMessage.from,
        adminSubject: adminMessage.subject,
        customerSubject: customerMessage.subject
      });

      // Wrap email sending with timeout promise to prevent hanging
      const emailTimeout = (promise, timeoutMs = 15000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email sending timeout')), timeoutMs)
          )
        ]);
      };

      log('📤 Attempting to send admin email...');
      const adminEmailStart = Date.now();
      
      // Send admin email with timeout
      const adminResult = await emailTimeout(transporter.sendMail(adminMessage));
      const adminEmailTime = Date.now() - adminEmailStart;
      log('✅ Admin email sent successfully', { 
        messageId: adminResult.messageId, 
        timeTaken: `${adminEmailTime}ms`,
        response: adminResult.response 
      });

      log('📤 Attempting to send customer email...');
      const customerEmailStart = Date.now();
      
      // Send customer email with timeout
      const customerResult = await emailTimeout(transporter.sendMail(customerMessage));
      const customerEmailTime = Date.now() - customerEmailStart;
      log('✅ Customer email sent successfully', { 
        messageId: customerResult.messageId, 
        timeTaken: `${customerEmailTime}ms`,
        response: customerResult.response 
      });
      
      log('🎉 All emails sent successfully via NodeMailer');
    } catch (emailError) {
      log('❌ Email sending failed', {
        errorMessage: emailError.message,
        errorCode: emailError.code,
        errorStack: emailError.stack
      });
      
      // Enhanced NodeMailer error logging
      if (emailError.code) {
        let errorAnalysis = '';
        switch (emailError.code) {
          case 'EAUTH':
            errorAnalysis = 'Authentication failed - check EMAIL_USER and EMAIL_PASSWORD (use App Password for Gmail)';
            break;
          case 'ECONNECTION':
            errorAnalysis = 'Connection failed - check internet connection and email provider settings';
            break;
          case 'ETIMEDOUT':
            errorAnalysis = 'Connection timeout - email service not responding';
            break;
          default:
            errorAnalysis = 'Unknown email service error';
        }
        log('📋 Error analysis', { errorAnalysis });
      }
      
      log('📝 Order details (email failed)', {
        orderId,
        customerEmail: customer.email,
        productName,
        finalPrice: `₪${finalPrice}`
      });
      
      // Continue with success response even if email fails
      // The order is still valid, just email notification failed
    }

    const totalTime = Date.now() - startTime;
    log('🎯 Order processed successfully', {
      orderId,
      customerEmail: customer.email,
      productName,
      totalProcessingTime: `${totalTime}ms`
    });

    res.status(200).json({
      success: true,
      message: 'Order submitted successfully',
      data: {
        orderId,
        orderDate,
        finalPrice,
        estimatedContact: '24 hours'
      },
      logs: logs,
      debug: {
        processingTime: `${totalTime}ms`,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    log('💥 Fatal error in order processing', {
      errorMessage: error.message,
      errorCode: error.code,
      errorStack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Failed to submit order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      logs: logs,
      debug: {
        processingTime: `${totalTime}ms`,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;