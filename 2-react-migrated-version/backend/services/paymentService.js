const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  constructor() {
    this.isConfigured = !!process.env.STRIPE_SECRET_KEY;
  }

  // Check if payment service is properly configured
  isReady() {
    return this.isConfigured;
  }

  // Create payment intent
  async createPaymentIntent(order, amount, currency = 'ils') {
    if (!this.isReady()) {
      throw new Error('Stripe not configured');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        metadata: {
          orderId: order.orderId,
          customerEmail: order.customer.email,
          customerName: order.customer.name
        },
        description: `Wood Kits Order #${order.orderId}`,
        receipt_email: order.customer.email
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw error;
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId, paymentMethodId) {
    if (!this.isReady()) {
      throw new Error('Stripe not configured');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });

      return {
        status: paymentIntent.status,
        paymentMethod: paymentIntent.payment_method,
        charges: paymentIntent.charges.data
      };
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      throw error;
    }
  }

  // Create refund
  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    if (!this.isReady()) {
      throw new Error('Stripe not configured');
    }

    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason
      };

      if (amount) {
        refundData.amount = amount;
      }

      const refund = await stripe.refunds.create(refundData);

      return {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason
      };
    } catch (error) {
      console.error('Stripe refund creation error:', error);
      throw error;
    }
  }

  // Get payment intent
  async getPaymentIntent(paymentIntentId) {
    if (!this.isReady()) {
      throw new Error('Stripe not configured');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent retrieval error:', error);
      throw error;
    }
  }

  // Webhook signature verification
  verifyWebhookSignature(body, signature) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      return stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Stripe webhook verification error:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhook(event) {
    console.log(`Processing Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        return await this.handlePaymentSuccess(event.data.object);
      
      case 'payment_intent.payment_failed':
        return await this.handlePaymentFailed(event.data.object);
      
      case 'charge.dispute.created':
        return await this.handleDispute(event.data.object);
      
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
        return { handled: false };
    }
  }

  // Handle successful payment
  async handlePaymentSuccess(paymentIntent) {
    try {
      const Order = require('../models/Order');
      
      const order = await Order.findOne({ 
        orderId: paymentIntent.metadata.orderId 
      });

      if (order) {
        order.payment = {
          ...order.payment,
          status: 'paid',
          stripePaymentIntentId: paymentIntent.id,
          paidAt: new Date(),
          amount: paymentIntent.amount / 100 // Convert from cents
        };
        
        // Update order status
        order.status = 'confirmed';
        order.statusHistory.push({
          status: 'confirmed',
          timestamp: new Date(),
          note: 'Payment received successfully'
        });

        await order.save();

        // Send confirmation email
        const EmailService = require('./emailService');
        const emailService = new EmailService();
        await emailService.sendOrderConfirmation(order);

        console.log(`Order ${order.orderId} payment confirmed`);
      }

      return { handled: true, orderId: paymentIntent.metadata.orderId };
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  // Handle failed payment
  async handlePaymentFailed(paymentIntent) {
    try {
      const Order = require('../models/Order');
      
      const order = await Order.findOne({ 
        orderId: paymentIntent.metadata.orderId 
      });

      if (order) {
        order.payment = {
          ...order.payment,
          status: 'failed',
          stripePaymentIntentId: paymentIntent.id,
          failureReason: paymentIntent.last_payment_error?.message
        };

        order.statusHistory.push({
          status: 'payment_failed',
          timestamp: new Date(),
          note: `Payment failed: ${paymentIntent.last_payment_error?.message}`
        });

        await order.save();
        console.log(`Order ${order.orderId} payment failed`);
      }

      return { handled: true, orderId: paymentIntent.metadata.orderId };
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  }

  // Handle dispute
  async handleDispute(charge) {
    console.log(`Dispute created for charge: ${charge.id}`);
    // Add dispute handling logic here
    return { handled: true, chargeId: charge.id };
  }
}

module.exports = PaymentService;