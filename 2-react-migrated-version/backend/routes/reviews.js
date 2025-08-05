const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { reviewValidation } = require('../validation/reviewValidation');

// @desc    Get reviews for a product
// @route   GET /api/v1/reviews/product/:productId
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      language = 'en',
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Get reviews
    const reviews = await Review.getProductReviews(productId, {
      language,
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    });

    // Get review statistics
    const stats = await Review.getReviewStats(productId);

    // Get total count for pagination
    const totalReviews = await Review.countDocuments({
      productId,
      status: 'approved',
      ...(language && { language })
    });
    
    const totalPages = Math.ceil(totalReviews / parseInt(limit));

    res.json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReviews,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// @desc    Submit a review
// @route   POST /api/v1/reviews
// @access  Public
router.post('/', optionalAuth, validate(reviewValidation.create), async (req, res) => {
  try {
    const {
      productId,
      customer,
      rating,
      title,
      text,
      language = 'en'
    } = req.body;

    // Check if product exists
    const product = await Product.findOne({ productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check for duplicate reviews from same email (if provided)
    if (customer.email) {
      const existingReview = await Review.findOne({
        productId,
        'customer.email': customer.email.toLowerCase()
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product'
        });
      }
    }

    // Create review
    const reviewData = {
      product: product._id,
      productId,
      customer: {
        name: customer.name,
        email: customer.email?.toLowerCase(),
        verified: false // Will be set to true if linked to an order
      },
      rating,
      title,
      text,
      language,
      status: 'pending', // Reviews need moderation by default
      metadata: {
        source: 'website',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    };

    // TODO: Check if customer has purchased this product
    // If yes, mark as verified and auto-approve

    const review = new Review(reviewData);
    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending moderation',
      data: {
        id: review._id,
        status: review.status,
        submittedAt: review.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message
    });
  }
});

// @desc    Mark review as helpful
// @route   POST /api/v1/reviews/:id/helpful
// @access  Public
router.post('/:id/helpful', async (req, res) => {
  try {
    const { id } = req.params;
    const userIdentifier = req.ip; // Use IP as identifier

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark unapproved review as helpful'
      });
    }

    await review.markHelpful(userIdentifier);

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulCount: review.helpful.count
      }
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

// @desc    Get review by ID
// @route   GET /api/v1/reviews/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('product', 'name productId images')
      .lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Review not available'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
});

// @desc    Get recent reviews (for homepage, etc.)
// @route   GET /api/v1/reviews/recent
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const { 
      limit = 5,
      language,
      minRating = 4
    } = req.query;

    const query = {
      status: 'approved',
      rating: { $gte: parseInt(minRating) }
    };

    if (language) {
      query.language = language;
    }

    const reviews = await Review.find(query)
      .populate('product', 'name productId images')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('customer.name rating text product createdAt')
      .lean();

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent reviews',
      error: error.message
    });
  }
});

module.exports = router;