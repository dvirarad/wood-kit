const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    // For testing - log order details instead of sending emails if SendGrid fails
    try {
      // Send emails
      const messages = [
        {
          to: process.env.SENDGRID_TO_EMAIL || 'orders@woodkits.com',
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

      await sgMail.send(messages);
      console.log('✅ Order emails sent successfully via SendGrid');
    } catch (emailError) {
      console.log('⚠️ Email sending failed, logging order details instead:');
      console.log('Order ID:', orderId);
      console.log('Customer:', customer);
      console.log('Product:', productName);
      console.log('Final Price: ₪' + finalPrice);
      // Continue with success response even if email fails
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