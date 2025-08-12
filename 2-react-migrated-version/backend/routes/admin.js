const express = require('express');
const router = express.Router();
const { adminOnly, adminLogin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { adminValidation } = require('../validation/adminValidation');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');

// Seed data for production deployment
const seedData = {
  products: [
    {
      productId: 'amsterdam-bookshelf',
      name: {
        en: 'Amsterdam Bookshelf',
        he: 'ספרייה אמסטרדם',
        es: 'Estantería Amsterdam'
      },
      description: {
        en: 'Modern bookshelf with clean lines. Customize height and width to fit your space perfectly.',
        he: 'ספרייה מודרנית עם קווים נקיים. התאימו גובה ורוחב כדי להתאים לחלל שלכם בצורה מושלמת.',
        es: 'Estantería moderna con líneas limpias. Personaliza altura y ancho para adaptarse perfectamente a tu espacio.'
      },
      basePrice: 199,
      currency: 'NIS',
      dimensions: {
        height: { min: 100, max: 250, default: 180, multiplier: 0.5 },
        width: { min: 60, max: 120, default: 80, multiplier: 0.3 },
        depth: { min: 25, max: 40, default: 30, multiplier: 0.4 }
      },
      options: {
        lacquer: { available: true, price: 45 },
        handrail: { available: false, price: 0 }
      },
      category: 'bookshelf',
      tags: ['modern', 'minimalist', 'customizable'],
      images: [{ url: '/images/amsterdam-bookshelf-1.jpg', alt: 'Amsterdam Bookshelf', isPrimary: true }],
      isActive: true,
      inventory: { inStock: true, stockLevel: 50, lowStockThreshold: 5 },
      ratings: { average: 4.8, count: 24 }
    },
    {
      productId: 'venice-bookshelf',
      name: {
        en: 'Venice Bookshelf',
        he: 'ספרייה ונציה',
        es: 'Estantería Venecia'
      },
      description: {
        en: 'Classic design bookshelf with elegant curves. Choose your dimensions for the perfect fit.',
        he: 'ספרייה בעיצוב קלאסי עם קימורים אלגנטיים. בחרו את המידות שלכם להתאמה מושלמת.',
        es: 'Estantería de diseño clásico con curvas elegantes. Elige tus dimensiones para un ajuste perfecto.'
      },
      basePrice: 249,
      currency: 'NIS',
      dimensions: {
        height: { min: 120, max: 300, default: 200, multiplier: 0.4 },
        width: { min: 70, max: 140, default: 90, multiplier: 0.35 }
      },
      options: {
        lacquer: { available: true, price: 45 },
        handrail: { available: false, price: 0 }
      },
      category: 'bookshelf',
      tags: ['classic', 'elegant', 'traditional'],
      images: [{ url: '/images/venice-bookshelf-1.jpg', alt: 'Venice Bookshelf', isPrimary: true }],
      isActive: true,
      inventory: { inStock: true, stockLevel: 30, lowStockThreshold: 5 },
      ratings: { average: 4.6, count: 18 }
    },
    {
      productId: 'stairs',
      name: {
        en: 'Custom Stairs',
        he: 'מדרגות מותאמות',
        es: 'Escaleras Personalizadas'
      },
      description: {
        en: 'Wooden stairs for indoor use. Fully customizable dimensions with optional handrail.',
        he: 'מדרגות עץ לשימוש פנימי. מידות הניתנות להתאמה מלאה עם מעקה אופציונלי.',
        es: 'Escaleras de madera para uso interior. Dimensiones totalmente personalizables con barandilla opcional.'
      },
      basePrice: 299,
      currency: 'NIS',
      dimensions: {
        length: { min: 150, max: 400, default: 250, multiplier: 0.8 },
        width: { min: 60, max: 120, default: 80, multiplier: 0.5 },
        height: { min: 50, max: 150, default: 100, multiplier: 0.6 },
        steps: { min: 3, max: 12, default: 6, multiplier: 15 }
      },
      options: {
        lacquer: { available: true, price: 45 },
        handrail: { available: true, price: 120 }
      },
      category: 'stairs',
      tags: ['custom', 'indoor', 'functional'],
      images: [{ url: '/images/stairs-1.jpg', alt: 'Custom Wooden Stairs', isPrimary: true }],
      isActive: true,
      inventory: { inStock: true, stockLevel: 15, lowStockThreshold: 3 },
      ratings: { average: 4.9, count: 12 }
    },
    {
      productId: 'garden-bench',
      name: {
        en: 'Garden Bench',
        he: 'ספסל גינה',
        es: 'Banco de Jardín'
      },
      description: {
        en: 'Beautiful outdoor bench perfect for gardens and patios. Customize length, width, and height.',
        he: 'ספסל חיצוני יפה מושלם לגינות ופטיו. התאימו אורך, רוחב וגובה.',
        es: 'Hermoso banco para exteriores perfecto para jardines y patios. Personaliza largo, ancho y altura.'
      },
      basePrice: 179,
      currency: 'NIS',
      dimensions: {
        length: { min: 100, max: 200, default: 150, multiplier: 0.4 },
        width: { min: 30, max: 50, default: 40, multiplier: 0.3 },
        height: { min: 40, max: 60, default: 45, multiplier: 0.5 }
      },
      options: {
        lacquer: { available: true, price: 45 },
        handrail: { available: false, price: 0 }
      },
      category: 'outdoor',
      tags: ['outdoor', 'garden', 'seating'],
      images: [{ url: '/images/garden-bench-1.jpg', alt: 'Garden Bench', isPrimary: true }],
      isActive: true,
      inventory: { inStock: true, stockLevel: 25, lowStockThreshold: 5 },
      ratings: { average: 4.7, count: 31 }
    },
    {
      productId: 'wooden-planter',
      name: {
        en: 'Wooden Planter',
        he: 'עציץ עץ',
        es: 'Maceta de Madera'
      },
      description: {
        en: 'Custom wooden planter for your garden. Perfect for herbs, flowers, and small plants.',
        he: 'עציץ עץ מותאם אישית לגינה שלכם. מושלם לעשבי תיבול, פרחים וצמחים קטנים.',
        es: 'Maceta de madera personalizada para tu jardín. Perfecta para hierbas, flores y plantas pequeñas.'
      },
      basePrice: 89,
      currency: 'NIS',
      dimensions: {
        length: { min: 40, max: 120, default: 60, multiplier: 0.3 },
        height: { min: 20, max: 60, default: 30, multiplier: 0.4 }
      },
      options: {
        lacquer: { available: true, price: 25 },
        handrail: { available: false, price: 0 }
      },
      category: 'outdoor',
      tags: ['planter', 'garden', 'plants'],
      images: [{ url: '/images/wooden-planter-1.jpg', alt: 'Wooden Planter', isPrimary: true }],
      isActive: true,
      inventory: { inStock: true, stockLevel: 40, lowStockThreshold: 8 },
      ratings: { average: 4.5, count: 27 }
    },
    {
      productId: 'dog-bed',
      name: {
        en: 'Dog Bed',
        he: 'מיטה לכלב',
        es: 'Cama para Perro'
      },
      description: {
        en: 'Comfortable wooden dog bed designed for your pet\'s comfort. Choose the perfect size for your furry friend.',
        he: 'מיטת עץ נוחה לכלב המיועדת לנוחות של חיית המחמד שלכם. בחרו את הגודל המושלם לחבר הפרוותי שלכם.',
        es: 'Cama de madera cómoda para perro diseñada para la comodidad de tu mascota. Elige el tamaño perfecto para tu amigo peludo.'
      },
      basePrice: 129,
      currency: 'NIS',
      dimensions: {
        length: { min: 60, max: 120, default: 80, multiplier: 0.4 },
        width: { min: 40, max: 80, default: 60, multiplier: 0.3 },
        height: { min: 15, max: 25, default: 20, multiplier: 0.8 }
      },
      options: {
        lacquer: { available: true, price: 35 },
        handrail: { available: false, price: 0 }
      },
      category: 'pet',
      tags: ['pet', 'bed', 'comfort'],
      images: [{ url: '/images/dog-bed-1.jpg', alt: 'Wooden Dog Bed', isPrimary: true }],
      isActive: true,
      inventory: { inStock: true, stockLevel: 20, lowStockThreshold: 4 },
      ratings: { average: 4.8, count: 19 }
    }
  ]
};

// @desc    Admin login
// @route   POST /api/v1/admin/login
// @access  Public
router.post('/login', validate(adminValidation.login), adminLogin);

// @desc    Seed database with initial data
// @route   POST /api/v1/admin/seed
// @access  Public (with admin key)
router.post('/seed', async (req, res) => {
  try {
    // Simple authentication for seeding
    const { adminKey } = req.body;
    if (adminKey !== process.env.ADMIN_SEED_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin key'
      });
    }

    // Check if already seeded
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      return res.json({
        success: true,
        message: 'Database already seeded',
        data: { products: existingProducts }
      });
    }

    // Seed products
    const insertedProducts = await Product.insertMany(seedData.products);

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        products: insertedProducts.length
      }
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding database',
      error: error.message
    });
  }
});

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

// @desc    Update product pricing and details (Admin only)
// @route   PUT /api/v1/admin/pricing/:productId
// @access  Private/Admin
router.put('/pricing/:productId', adminOnly, validate(adminValidation.updatePricing), async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, basePrice, dimensions, options, images } = req.body;

    const updateData = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (basePrice !== undefined) {
      updateData.basePrice = basePrice;
    }
    
    if (dimensions) {
      updateData.dimensions = dimensions;
    }
    
    if (options) {
      updateData.options = options;
    }
    
    if (images) {
      updateData.images = images;
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
      message: 'Product updated successfully',
      data: {
        productId: product.productId,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        dimensions: product.dimensions,
        options: product.options,
        images: product.images,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
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