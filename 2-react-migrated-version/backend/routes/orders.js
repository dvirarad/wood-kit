const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/ProductSimple');
const { adminOnly, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { orderValidation } = require('../validation/orderValidation');
const emailService = require('../services/emailService');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Public
router.post('/', validate(orderValidation.create), async (req, res) => {
  try {
    const { customer, items, notes, language = 'en' } = req.body;

    // Validate and process items
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      // Find product
      const product = await Product.findOne({ 
        productId: item.productId,
        isActive: true 
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      // Check inventory
      if (!product.inventory.inStock) {
        return res.status(400).json({
          success: false,
          message: `Product out of stock: ${item.productId}`
        });
      }

      // Calculate pricing
      const pricing = Product.calculatePrice(
        product.basePrice,
        product.dimensions,
        item.configuration.dimensions,
        item.configuration.options
      );

      const processedItem = {
        product: product._id,
        productId: item.productId,
        name: product.name[language] || product.name.en,
        configuration: item.configuration,
        pricing: {
          basePrice: pricing.basePrice,
          sizeAdjustment: pricing.sizeAdjustment,
          optionsCost: pricing.optionsCost,
          unitPrice: pricing.totalPrice
        },
        quantity: item.quantity || 1,
        totalPrice: pricing.totalPrice * (item.quantity || 1)
      };

      processedItems.push(processedItem);
      subtotal += processedItem.totalPrice;
    }

    // Create order
    const orderData = {
      customer,
      items: processedItems,
      pricing: {
        subtotal,
        taxRate: 0.17, // 17% VAT in Israel
        tax: subtotal * 0.17,
        shipping: 0,
        discount: 0,
        total: subtotal * 1.17
      },
      currency: 'NIS',
      notes: {
        customer: notes || ''
      },
      metadata: {
        source: 'website',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        language
      }
    };

    const order = new Order(orderData);
    await order.save();

    // Send confirmation email
    try {
      await emailService.sendOrderConfirmation(order, language);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.orderId,
        id: order._id,
        total: order.pricing.total,
        currency: order.currency,
        status: order.status,
        estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Public (with order ID) / Private (admin)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query; // Customer email for verification

    // Find order by orderId or MongoDB _id
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };
    
    const order = await Order.findOne(query)
      .populate('items.product', 'name images')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If not admin, verify customer email
    if (email && order.customer.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Invalid email verification.'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// @desc    Get orders (Admin only)
// @route   GET /api/v1/orders
// @access  Private/Admin
router.get('/', adminOnly, async (req, res) => {
  try {
    const {
      status,
      customer,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (customer) {
      query.$or = [
        { 'customer.name': { $regex: customer, $options: 'i' } },
        { 'customer.email': { $regex: customer, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get orders
    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'name productId')
      .lean();

    // Get total count
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    // Get summary data
    const orderSummaries = orders.map(order => order.getSummary ? order.getSummary() : {
      id: order._id,
      orderId: order.orderId,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      itemsCount: order.items.reduce((count, item) => count + item.quantity, 0),
      total: order.pricing.total,
      currency: order.currency,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });

    res.json({
      success: true,
      data: orderSummaries,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', adminOnly, validate(orderValidation.updateStatus), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    // Find order
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.status = status;
    if (note) {
      order.notes.admin = note;
    }

    await order.save();

    // Send status update email
    try {
      await emailService.sendOrderStatusUpdate(order);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order.orderId,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// @desc    Get order statistics (Admin only)
// @route   GET /api/v1/orders/stats/summary
// @access  Private/Admin
router.get('/stats/summary', adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          statusCounts: {
            $push: '$status'
          }
        }
      }
    ]);

    const statusDistribution = {};
    if (stats.length > 0) {
      stats[0].statusCounts.forEach(status => {
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        totalOrders: stats[0]?.totalOrders || 0,
        totalRevenue: Math.round((stats[0]?.totalRevenue || 0) * 100) / 100,
        averageOrderValue: Math.round((stats[0]?.averageOrderValue || 0) * 100) / 100,
        statusDistribution,
        currency: 'NIS'
      }
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
});

module.exports = router;