const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'info@woodkits.com';
    this.isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
  }

  // Create NodeMailer transporter
  createTransporter() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
    
    switch (emailProvider.toLowerCase()) {
      case 'gmail':
        return nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      
      case 'smtp':
        return nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      
      default:
        return nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
    }
  }

  // Check if email service is properly configured
  isReady() {
    return this.isConfigured;
  }

  // Send order confirmation email
  async sendOrderConfirmation(order, language = 'en') {
    if (!this.isReady()) {
      console.log('Email service not configured, skipping order confirmation');
      return { sent: false, reason: 'Service not configured' };
    }

    try {
      const translations = this.getTranslations(language);
      const template = this.generateOrderConfirmationTemplate(order, translations);
      const transporter = this.createTransporter();

      const mailOptions = {
        from: `Wood Kits Team <${this.fromEmail}>`,
        to: order.customer.email,
        subject: `${translations.orderConfirmation} - ${order.orderId}`,
        html: template.html,
        text: template.text
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log(`Order confirmation email sent to ${order.customer.email}`);
      return { sent: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(order, language = 'en') {
    if (!this.isReady()) {
      console.log('Email service not configured, skipping status update');
      return { sent: false, reason: 'Service not configured' };
    }

    try {
      const translations = this.getTranslations(language);
      const template = this.generateStatusUpdateTemplate(order, translations);
      const transporter = this.createTransporter();

      const mailOptions = {
        from: `Wood Kits Team <${this.fromEmail}>`,
        to: order.customer.email,
        subject: `${translations.orderUpdate} - ${order.orderId}`,
        html: template.html,
        text: template.text
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log(`Status update email sent to ${order.customer.email}`);
      return { sent: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending status update email:', error);
      throw error;
    }
  }

  // Send custom email
  async sendCustomEmail(to, subject, content, language = 'en') {
    if (!this.isReady()) {
      console.log('Email service not configured, skipping custom email');
      return { sent: false, reason: 'Service not configured' };
    }

    try {
      const transporter = this.createTransporter();
      
      const mailOptions = {
        from: `Wood Kits Team <${this.fromEmail}>`,
        to,
        subject,
        html: content.html || content,
        text: content.text || content
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log(`Custom email sent to ${to}`);
      return { sent: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending custom email:', error);
      throw error;
    }
  }

  // Generate order confirmation template
  generateOrderConfirmationTemplate(order, translations) {
    const itemsHTML = order.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 15px; vertical-align: top;">
          <strong style="color: #8B4513;">${item.name}</strong><br>
          <small style="color: #666;">
            ${translations.quantity}: ${item.quantity}<br>
            ${this.formatConfiguration(item.configuration, translations)}
          </small>
        </td>
        <td style="padding: 15px; text-align: right; vertical-align: top;">
          ₪${item.totalPrice.toFixed(2)}
        </td>
      </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html dir="${translations.dir || 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${translations.orderConfirmation}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
        <h1 style="margin: 0; font-size: 28px;">Wood Kits</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">${translations.orderConfirmation}</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h2 style="color: #8B4513; margin-top: 0;">${translations.orderDetails}</h2>
        <p><strong>${translations.orderNumber}:</strong> ${order.orderId}</p>
        <p><strong>${translations.orderDate}:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>${translations.customerName}:</strong> ${order.customer.name}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #8B4513;">${translations.orderItems}</h3>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${itemsHTML}
          <tr style="background: #f5f5f5;">
            <td style="padding: 15px; font-weight: bold;">${translations.subtotal}:</td>
            <td style="padding: 15px; text-align: right; font-weight: bold;">₪${order.pricing.subtotal.toFixed(2)}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 15px;">${translations.tax} (17%):</td>
            <td style="padding: 15px; text-align: right;">₪${order.pricing.tax.toFixed(2)}</td>
          </tr>
          <tr style="background: #8B4513; color: white;">
            <td style="padding: 15px; font-weight: bold; font-size: 18px;">${translations.total}:</td>
            <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">₪${order.pricing.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="background: #e8f5e8; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4CAF50;">
        <h3 style="color: #2E7D32; margin-top: 0;">${translations.whatNext}</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>${translations.processOrder}</li>
          <li>${translations.contactUpdate}</li>
          <li>${translations.estimatedDelivery}</li>
        </ul>
      </div>

      ${order.notes.customer ? `
      <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
        <strong>${translations.specialInstructions}:</strong><br>
        ${order.notes.customer}
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0; color: #666;">
        <p>${translations.questions} <a href="mailto:${this.fromEmail}" style="color: #8B4513;">${this.fromEmail}</a></p>
        <p>${translations.thankYou}</p>
        <strong style="color: #8B4513;">Wood Kits Team</strong>
      </div>
    </body>
    </html>`;

    const text = `
${translations.orderConfirmation}

${translations.orderDetails}:
${translations.orderNumber}: ${order.orderId}
${translations.orderDate}: ${new Date(order.createdAt).toLocaleDateString()}
${translations.customerName}: ${order.customer.name}

${translations.orderItems}:
${order.items.map(item => `- ${item.name} (${translations.quantity}: ${item.quantity}) - ₪${item.totalPrice.toFixed(2)}`).join('\n')}

${translations.subtotal}: ₪${order.pricing.subtotal.toFixed(2)}
${translations.tax} (17%): ₪${order.pricing.tax.toFixed(2)}
${translations.total}: ₪${order.pricing.total.toFixed(2)}

${translations.whatNext}:
- ${translations.processOrder}
- ${translations.contactUpdate}
- ${translations.estimatedDelivery}

${order.notes.customer ? `${translations.specialInstructions}: ${order.notes.customer}\n` : ''}

${translations.questions} ${this.fromEmail}

${translations.thankYou}
Wood Kits Team
    `;

    return { html, text };
  }

  // Generate status update template
  generateStatusUpdateTemplate(order, translations) {
    const statusMessages = {
      pending: translations.statusPending,
      confirmed: translations.statusConfirmed,
      processing: translations.statusProcessing,
      ready: translations.statusReady,
      shipped: translations.statusShipped,
      delivered: translations.statusDelivered,
      cancelled: translations.statusCancelled
    };

    const html = `
    <!DOCTYPE html>
    <html dir="${translations.dir || 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${translations.orderUpdate}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
        <h1 style="margin: 0; font-size: 28px;">Wood Kits</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">${translations.orderUpdate}</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h2 style="color: #8B4513; margin-top: 0;">${translations.hello} ${order.customer.name},</h2>
        <p>${translations.orderUpdateMessage} <strong>${order.orderId}</strong> ${translations.hasBeenUpdated}</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #8B4513;">
          <h3 style="margin-top: 0; color: #8B4513;">${translations.currentStatus}</h3>
          <p style="font-size: 18px; font-weight: bold; color: #2E7D32; margin: 0;">${statusMessages[order.status] || order.status}</p>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0; color: #666;">
        <p>${translations.questions} <a href="mailto:${this.fromEmail}" style="color: #8B4513;">${this.fromEmail}</a></p>
        <strong style="color: #8B4513;">Wood Kits Team</strong>
      </div>
    </body>
    </html>`;

    const text = `
${translations.orderUpdate}

${translations.hello} ${order.customer.name},

${translations.orderUpdateMessage} ${order.orderId} ${translations.hasBeenUpdated}

${translations.currentStatus}: ${statusMessages[order.status] || order.status}

${translations.questions} ${this.fromEmail}

Wood Kits Team
    `;

    return { html, text };
  }

  // Format configuration for display
  formatConfiguration(config, translations) {
    const parts = [];
    
    if (config.dimensions) {
      Object.entries(config.dimensions).forEach(([key, value]) => {
        if (value && typeof value === 'number') {
          const label = translations[key] || key;
          parts.push(`${label}: ${value}cm`);
        }
      });
    }
    
    if (config.options) {
      if (config.options.lacquer) {
        parts.push(translations.lacquerFinish || 'Lacquer Finish');
      }
      if (config.options.handrail) {
        parts.push(translations.handrail || 'Handrail');
      }
    }
    
    return parts.join(', ');
  }

  // Get translations for email templates
  getTranslations(language) {
    const translations = {
      en: {
        dir: 'ltr',
        orderConfirmation: 'Order Confirmation',
        orderUpdate: 'Order Status Update',
        orderDetails: 'Order Details',
        orderNumber: 'Order Number',
        orderDate: 'Order Date',
        customerName: 'Customer',
        orderItems: 'Order Items',
        quantity: 'Quantity',
        subtotal: 'Subtotal',
        tax: 'Tax',
        total: 'Total',
        whatNext: 'What happens next?',
        processOrder: 'We will process your order within 1-2 business days',
        contactUpdate: 'We will contact you with updates on your order status',
        estimatedDelivery: 'Estimated delivery time is 10-14 business days',
        specialInstructions: 'Special Instructions',
        questions: 'Questions? Contact us at',
        thankYou: 'Thank you for choosing Wood Kits!',
        hello: 'Hello',
        orderUpdateMessage: 'Your order',
        hasBeenUpdated: 'has been updated',
        currentStatus: 'Current Status',
        // Status translations
        statusPending: 'Order Received - Pending Processing',
        statusConfirmed: 'Order Confirmed - Processing',
        statusProcessing: 'In Production',
        statusReady: 'Ready for Pickup/Delivery',
        statusShipped: 'Shipped',
        statusDelivered: 'Delivered',
        statusCancelled: 'Cancelled',
        // Configuration
        length: 'Length',
        width: 'Width',
        height: 'Height',
        depth: 'Depth',
        steps: 'Steps',
        lacquerFinish: 'Lacquer Finish',
        handrail: 'Handrail'
      },
      he: {
        dir: 'rtl',
        orderConfirmation: 'אישור הזמנה',
        orderUpdate: 'עדכון סטטוס הזמנה',
        orderDetails: 'פרטי ההזמנה',
        orderNumber: 'מספר הזמנה',
        orderDate: 'תאריך הזמנה',
        customerName: 'לקוח',
        orderItems: 'פריטי ההזמנה',
        quantity: 'כמות',
        subtotal: 'סכום ביניים',
        tax: 'מס',
        total: 'סה"כ',
        whatNext: 'מה קורה הלאה?',
        processOrder: 'נעבד את ההזמנה שלך תוך 1-2 ימי עסקים',
        contactUpdate: 'ניצור קשר עם עדכונים על סטטוס ההזמנה',
        estimatedDelivery: 'זמן אספקה משוער: 10-14 ימי עסקים',
        specialInstructions: 'הוראות מיוחדות',
        questions: 'שאלות? צרו קשר:',
        thankYou: 'תודה שבחרתם בערכות עץ!',
        hello: 'שלום',
        orderUpdateMessage: 'ההזמנה שלך',
        hasBeenUpdated: 'עודכנה',
        currentStatus: 'סטטוס נוכחי',
        statusPending: 'הזמנה התקבלה - ממתינה לעיבוד',
        statusConfirmed: 'הזמנה אושרה - בעיבוד',
        statusProcessing: 'בייצור',
        statusReady: 'מוכן לאיסוף/משלוח',
        statusShipped: 'נשלח',
        statusDelivered: 'הועבר',
        statusCancelled: 'בוטל',
        length: 'אורך',
        width: 'רוחב',
        height: 'גובה',
        depth: 'עומק',
        steps: 'מדרגות',
        lacquerFinish: 'ציפוי לכה',
        handrail: 'מעקה'
      },
      es: {
        dir: 'ltr',
        orderConfirmation: 'Confirmación de Pedido',
        orderUpdate: 'Actualización del Estado del Pedido',
        orderDetails: 'Detalles del Pedido',
        orderNumber: 'Número de Pedido',
        orderDate: 'Fecha del Pedido',
        customerName: 'Cliente',
        orderItems: 'Artículos del Pedido',
        quantity: 'Cantidad',
        subtotal: 'Subtotal',
        tax: 'Impuesto',
        total: 'Total',
        whatNext: '¿Qué sigue?',
        processOrder: 'Procesaremos tu pedido en 1-2 días hábiles',
        contactUpdate: 'Te contactaremos con actualizaciones del estado',
        estimatedDelivery: 'Tiempo estimado de entrega: 10-14 días hábiles',
        specialInstructions: 'Instrucciones Especiales',
        questions: '¿Preguntas? Contáctanos en',
        thankYou: '¡Gracias por elegir Kits de Madera!',
        hello: 'Hola',
        orderUpdateMessage: 'Tu pedido',
        hasBeenUpdated: 'ha sido actualizado',
        currentStatus: 'Estado Actual',
        statusPending: 'Pedido Recibido - Pendiente de Procesamiento',
        statusConfirmed: 'Pedido Confirmado - Procesando',
        statusProcessing: 'En Producción',
        statusReady: 'Listo para Recoger/Entregar',
        statusShipped: 'Enviado',
        statusDelivered: 'Entregado',
        statusCancelled: 'Cancelado',
        length: 'Longitud',
        width: 'Ancho',
        height: 'Altura',
        depth: 'Profundidad',
        steps: 'Escalones',
        lacquerFinish: 'Acabado Lacado',
        handrail: 'Pasamanos'
      }
    };

    return translations[language] || translations.en;
  }
}

module.exports = new EmailService();