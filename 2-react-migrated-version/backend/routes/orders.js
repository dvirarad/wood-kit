const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// @desc    Check SendGrid configuration status
// @route   GET /api/v1/orders/email-status
// @access  Public (for debugging)
router.get('/email-status', async (req, res) => {
  try {
    const config = {
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      apiKeyLength: process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.length : 0,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@woodkits.com',
      toEmail: process.env.SENDGRID_TO_EMAIL || 'dvirarad@gmail.com'
    };

    let status = 'healthy';
    let issues = [];
    let statusCode = 200;

    // Check for configuration issues
    if (!config.hasApiKey) {
      status = 'unhealthy';
      issues.push('SendGrid API key not configured');
      statusCode = 503; // Service unavailable
    }

    if (config.apiKeyLength > 0 && config.apiKeyLength < 20) {
      status = 'warning';
      issues.push('SendGrid API key appears to be invalid (too short)');
      statusCode = 503;
    }

    if (!config.fromEmail || config.fromEmail.includes('noreply@woodkits.com')) {
      status = 'warning';
      issues.push('Using default from email - may not be verified');
    }

    const response = {
      success: status === 'healthy',
      status: status,
      message: status === 'healthy' ? 'Email service ready' : 'Email service has issues',
      config: config,
      issues: issues,
      recommendations: [
        'Verify sender email identity in SendGrid dashboard',
        'Test email functionality using /api/v1/orders/test-email',
        'Check environment variables: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_TO_EMAIL'
      ]
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
    console.log('🧪 Testing email functionality...');
    
    // Check environment variables
    const config = {
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      apiKeyLength: process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.length : 0,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@woodkits.com',
      toEmail: process.env.SENDGRID_TO_EMAIL || 'dvirarad@gmail.com'
    };
    
    console.log('📋 Email Configuration:', config);
    
    if (!config.hasApiKey) {
      return res.status(400).json({
        success: false,
        message: 'SendGrid API key not configured',
        config: config
      });
    }
    
    // Test email
    const testMessage = {
      to: config.toEmail,
      from: config.fromEmail,
      subject: '🧪 Wood Kits - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">🧪 Email Test Successful!</h2>
          <p>This is a test email from Wood Kits backend.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>API Key: ${config.hasApiKey ? '✅ Set' : '❌ Missing'}</li>
            <li>From Email: ${config.fromEmail}</li>
            <li>To Email: ${config.toEmail}</li>
          </ul>
          <p>If you received this email, SendGrid is working correctly! 🎉</p>
        </div>
      `
    };
    
    console.log('📧 Sending test email:', {
      to: testMessage.to,
      from: testMessage.from,
      subject: testMessage.subject
    });
    
    await sgMail.send(testMessage);
    console.log('✅ Test email sent successfully!');
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      config: config,
      sentTo: testMessage.to
    });
    
  } catch (error) {
    console.log('❌ Test email failed:', error);
    
    let errorDetails = {
      message: error.message,
      code: error.code
    };
    
    let statusCode = 500; // Default server error
    let userMessage = 'Test email failed';
    
    if (error.response) {
      errorDetails.status = error.response.status;
      errorDetails.body = error.response.body;
      
      // Map SendGrid errors to appropriate HTTP status codes
      switch (error.response.status) {
        case 400:
          statusCode = 502; // Bad Gateway - external service error
          userMessage = 'Invalid email configuration';
          break;
        case 401:
          statusCode = 502; // Bad Gateway - external service error
          userMessage = 'Invalid SendGrid API key';
          break;
        case 403:
          statusCode = 502; // Bad Gateway - external service error
          userMessage = 'SendGrid sender identity not verified';
          break;
        case 429:
          statusCode = 429; // Keep 429 for rate limiting
          userMessage = 'SendGrid rate limit exceeded';
          break;
        default:
          statusCode = 502;
          userMessage = 'SendGrid service error';
      }
    }
    
    res.status(statusCode).json({
      success: false,
      message: userMessage,
      error: errorDetails,
      config: {
        hasApiKey: !!process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@woodkits.com',
        toEmail: process.env.SENDGRID_TO_EMAIL || 'dvirarad@gmail.com'
      }
    });
  }
});

// @desc    Submit new order
// @route   POST /api/v1/orders
// @access  Public
router.post('/', async (req, res) => {
  try {
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

    // Validate required fields
    if (!productId || !productName || !customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order information'
      });
    }

    // Generate order ID
    const orderId = `WK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

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

    // Check SendGrid configuration
    console.log('📧 Email configuration check:');
    console.log('- SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'MISSING');
    console.log('- SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || 'USING DEFAULT');
    console.log('- SENDGRID_TO_EMAIL:', process.env.SENDGRID_TO_EMAIL || 'USING DEFAULT');

    // For testing - log order details instead of sending emails if SendGrid fails
    try {
      // Send emails
      const messages = [
        {
          to: process.env.SENDGRID_TO_EMAIL || 'dvirarad@gmail.com',
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@woodkits.com',
          subject: `🪵 הזמנה חדשה #${orderId} - ${productName}`,
          html: adminEmailHtml
        },
        {
          to: customer.email,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@woodkits.com',
          subject: `תודה על ההזמנה - Wood Kits #${orderId}`,
          html: customerEmailHtml
        }
      ];

      console.log('📨 Attempting to send emails:', {
        adminEmail: messages[0].to,
        customerEmail: messages[1].to,
        fromEmail: messages[0].from
      });

      await sgMail.send(messages);
      console.log('✅ Order emails sent successfully via SendGrid');
    } catch (emailError) {
      console.log('❌ Email sending failed:', emailError);
      console.log('⚠️ Email error details:');
      
      // Enhanced SendGrid error logging
      if (emailError.response) {
        console.log('- SendGrid Status:', emailError.response.status);
        console.log('- SendGrid Body:', JSON.stringify(emailError.response.body, null, 2));
        
        // Log specific SendGrid error types
        switch (emailError.response.status) {
          case 400:
            console.log('🚨 SendGrid Error: Invalid email configuration');
            break;
          case 401:
            console.log('🚨 SendGrid Error: Invalid API key');
            break;
          case 403:
            console.log('🚨 SendGrid Error: Sender identity not verified');
            console.log('📋 Action needed: Verify sender email in SendGrid dashboard');
            break;
          case 429:
            console.log('🚨 SendGrid Error: Rate limit exceeded');
            break;
          default:
            console.log('🚨 SendGrid Error: Service error');
        }
      }
      console.log('- Error Message:', emailError.message);
      console.log('- Error Code:', emailError.code);
      
      console.log('📝 Order details (email failed):');
      console.log('- Order ID:', orderId);
      console.log('- Customer:', customer.email);
      console.log('- Product:', productName);
      console.log('- Final Price: ₪' + finalPrice);
      
      // Continue with success response even if email fails
      // The order is still valid, just email notification failed
    }

    console.log('Order processed successfully:', {
      orderId,
      customerEmail: customer.email,
      productName
    });

    res.status(200).json({
      success: true,
      message: 'Order submitted successfully',
      data: {
        orderId,
        orderDate,
        finalPrice,
        estimatedContact: '24 hours'
      }
    });

  } catch (error) {
    console.error('Order submission error:', error);
    
    // Check if it's a SendGrid error
    if (error.code && error.code >= 400) {
      console.error('SendGrid error:', error.response?.body);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;