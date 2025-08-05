const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { paymentValidation } = require('../validation/paymentValidation');
const PaymentService = require('../services/paymentService');

const paymentService = new PaymentService();

// @desc    Create payment intent (Stripe)
// @route   POST /api/v1/payments/create-intent
// @access  Public
router.post('/create-intent', validate(paymentValidation.createPaymentIntent), async (req, res) => {
  try {
    const { orderId, amount, currency = 'ils' } = req.body;

    if (!paymentService.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured'
      });
    }

    // Find order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify amount matches order total (convert NIS to agorot for Stripe)
    const expectedAmount = Math.round(order.pricing.total * 100); // Convert to agorot
    if (Math.abs(amount - expectedAmount) > 1) { // Allow 1 agora difference for rounding
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch',
        expected: expectedAmount,
        provided: amount
      });
    }

    // Create payment intent using service
    const paymentResult = await paymentService.createPaymentIntent(order, amount, currency);

    res.json({
      success: true,
      data: {
        clientSecret: paymentResult.clientSecret,
        paymentIntentId: paymentResult.paymentIntentId,
        amount,
        currency
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
});

// @desc    Confirm payment
// @route   POST /api/v1/payments/confirm
// @access  Public
router.post('/confirm', validate(paymentValidation.confirm), async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.metadata.orderId !== orderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment and order mismatch'
      });
    }

    // Find order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order based on payment status
    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentDetails = {
        transactionId: paymentIntent.id,
        paymentProvider: 'stripe',
        paymentDate: new Date()
      };
    } else if (paymentIntent.status === 'payment_failed') {
      order.paymentStatus = 'failed';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Payment confirmed',
      data: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        transactionId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
});

// @desc    Handle Stripe webhook
// @route   POST /api/v1/payments/webhook
// @access  Public (Stripe webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.log('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook error',
      error: error.message
    });
  }
});

// Helper function to handle successful payments
async function handlePaymentSuccess(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    const order = await Order.findOne({ orderId });

    if (order) {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentDetails = {
        transactionId: paymentIntent.id,
        paymentProvider: 'stripe',
        paymentDate: new Date()
      };
      await order.save();

      console.log(`Payment succeeded for order ${orderId}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Helper function to handle failed payments
async function handlePaymentFailure(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    const order = await Order.findOne({ orderId });

    if (order) {
      order.paymentStatus = 'failed';
      await order.save();

      console.log(`Payment failed for order ${orderId}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// @desc    Get payment status
// @route   GET /api/v1/payments/status/:orderId
// @access  Public
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId })
      .select('orderId paymentStatus status paymentDetails pricing.total currency');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        amount: order.pricing.total,
        currency: order.currency,
        transactionId: order.paymentDetails?.transactionId
      }
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message
    });
  }
});

// @desc    Refund payment (Admin only)
// @route   POST /api/v1/payments/refund
// @access  Private/Admin
router.post('/refund', adminOnly, validate(paymentValidation.refund), async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured'
      });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.paymentDetails?.transactionId) {
      return res.status(400).json({
        success: false,
        message: 'No payment found for this order'
      });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentDetails.transactionId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to agorot
      reason: reason || 'requested_by_customer',
      metadata: {
        orderId: order.orderId
      }
    });

    // Update order
    order.paymentStatus = 'refunded';
    order.status = 'refunded';
    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100, // Convert back to NIS
        currency: refund.currency,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
});

module.exports = router;