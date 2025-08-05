const express = require('express');
const router = express.Router();
const { adminOnly, adminLogin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { adminValidation } = require('../validation/adminValidation');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');

// @desc    Admin login
// @route   POST /api/v1/admin/login
// @access  Public
router.post('/login', validate(adminValidation.login), adminLogin);

// @desc    Get admin dashboard data
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get orders statistics
    const orderStats = await Order.aggregate([
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
          statusCounts: { $push: '$status' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId customer.name pricing.total status createdAt')
      .lean();

    // Get product statistics
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          averageRating: { $avg: '$ratings.average' },
          totalReviews: { $sum: '$ratings.count' }
        }
      }
    ]);

    // Get pending reviews count
    const pendingReviews = await Review.countDocuments({ status: 'pending' });

    // Process status distribution
    const statusDistribution = {};
    if (orderStats.length > 0 && orderStats[0].statusCounts) {
      orderStats[0].statusCounts.forEach(status => {
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      });
    }

    // Get daily revenue for chart (last 7 days)
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $nin: ['cancelled', 'refunded'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        summary: {
          totalOrders: orderStats[0]?.totalOrders || 0,
          totalRevenue: Math.round((orderStats[0]?.totalRevenue || 0) * 100) / 100,
          averageOrderValue: Math.round((orderStats[0]?.averageOrderValue || 0) * 100) / 100,
          totalProducts: productStats[0]?.totalProducts || 0,
          activeProducts: productStats[0]?.activeProducts || 0,
          averageProductRating: Math.round((productStats[0]?.averageRating || 0) * 10) / 10,
          totalReviews: productStats[0]?.totalReviews || 0,
          pendingReviews
        },
        statusDistribution,
        recentOrders,
        dailyRevenue,
        currency: 'NIS'
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// @desc    Update product pricing (Admin only)
// @route   PUT /api/v1/admin/pricing/:productId
// @access  Private/Admin
router.put('/pricing/:productId', adminOnly, validate(adminValidation.updatePricing), async (req, res) => {
  try {
    const { productId } = req.params;
    const { basePrice, dimensions, options } = req.body;

    const updateData = {};
    
    if (basePrice !== undefined) {
      updateData.basePrice = basePrice;
    }
    
    if (dimensions) {
      updateData.dimensions = dimensions;
    }
    
    if (options) {
      updateData.options = options;
    }

    const product = await Product.findOneAndUpdate(
      { productId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Pricing updated successfully',
      data: {
        productId: product.productId,
        basePrice: product.basePrice,
        dimensions: product.dimensions,
        options: product.options,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pricing',
      error: error.message
    });
  }
});

// @desc    Get all pricing data (Admin only)
// @route   GET /api/v1/admin/pricing
// @access  Private/Admin
router.get('/pricing', adminOnly, async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('productId name basePrice dimensions options currency updatedAt')
      .sort('productId')
      .lean();

    const pricingData = products.map(product => ({
      id: product._id,
      productId: product.productId,
      name: product.name,
      basePrice: product.basePrice,
      currency: product.currency,
      dimensions: product.dimensions,
      options: product.options,
      lastUpdated: product.updatedAt
    }));

    res.json({
      success: true,
      data: pricingData
    });
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing data',
      error: error.message
    });
  }
});

// @desc    Moderate reviews (Admin only)
// @route   PUT /api/v1/admin/reviews/:id/moderate
// @access  Private/Admin
router.put('/reviews/:id/moderate', adminOnly, validate(adminValidation.moderateReview), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, moderationNotes } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { 
        status,
        moderationNotes,
        moderatedAt: new Date()
      },
      { new: true }
    ).populate('product', 'name productId');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review moderated successfully',
      data: {
        id: review._id,
        status: review.status,
        product: review.product,
        moderatedAt: review.moderatedAt
      }
    });
  } catch (error) {
    console.error('Error moderating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating review',
      error: error.message
    });
  }
});

// @desc    Get pending reviews (Admin only)
// @route   GET /api/v1/admin/reviews/pending
// @access  Private/Admin
router.get('/reviews/pending', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ status: 'pending' })
      .populate('product', 'name productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalReviews = await Review.countDocuments({ status: 'pending' });
    const totalPages = Math.ceil(totalReviews / parseInt(limit));

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending reviews',
      error: error.message
    });
  }
});

// @desc    System health check (Admin only)
// @route   GET /api/v1/admin/health
// @access  Private/Admin
router.get('/health', adminOnly, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          name: mongoose.connection.name
        },
        server: {
          status: 'running',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version
        }
      },
      environment: process.env.NODE_ENV
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

module.exports = router;