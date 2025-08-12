const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { productValidation } = require('../validation/productValidation');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      active = 'true',
      language = 'en',
      page = 1,
      limit = 50,
      sort = 'createdAt'
    } = req.query;

    // Build query
    const query = { isActive: active === 'true' };
    if (category) {
      query.category = category;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with pagination
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    // Localize products
    const localizedProducts = products.map(product => {
      const localized = {
        id: product._id,
        productId: product.productId,
        name: product.name[language] || product.name.en,
        description: product.description[language] || product.description.en,
        basePrice: product.basePrice,
        currency: product.currency,
        dimensions: product.dimensions,
        options: product.options,
        category: product.category,
        tags: product.tags,
        images: product.images,
        ratings: product.ratings,
        inventory: product.inventory,
        createdAt: product.createdAt
      };
      return localized;
    });

    res.json({
      success: true,
      data: localizedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      meta: {
        language,
        resultsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    const { id } = req.params;

    // Find by MongoDB _id or productId
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { productId: id };
    
    const product = await Product.findOne(query)
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Localize product
    const localizedProduct = {
      id: product._id,
      productId: product.productId,
      name: product.name[language] || product.name.en,
      description: product.description[language] || product.description.en,
      basePrice: product.basePrice,
      currency: product.currency,
      dimensions: product.dimensions,
      options: product.options,
      category: product.category,
      tags: product.tags,
      images: product.images,
      ratings: product.ratings,
      inventory: product.inventory,
      reviews: product.reviews || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    res.json({
      success: true,
      data: localizedProduct,
      meta: { language }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// @desc    Calculate product price
// @route   POST /api/v1/products/:id/calculate-price
// @access  Public
router.post('/:id/calculate-price', async (req, res) => {
  try {
    const { id } = req.params;
    const { dimensions: selectedDimensions, options = {} } = req.body;

    // Find product
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { productId: id };
    const product = await Product.findOne(query);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate pricing
    const pricing = Product.calculatePrice(
      product.basePrice,
      product.dimensions,
      selectedDimensions,
      options
    );

    res.json({
      success: true,
      data: {
        productId: product.productId,
        pricing,
        currency: product.currency
      }
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating price',
      error: error.message
    });
  }
});

// @desc    Create product (Admin only)
// @route   POST /api/v1/products
// @access  Private/Admin
router.post('/', adminOnly, validate(productValidation.create), async (req, res) => {
  try {
    // Admin authentication is handled by adminOnly middleware

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// @desc    Update product (Admin only)
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
router.put('/:id', adminOnly, validate(productValidation.update), async (req, res) => {
  try {
    // Admin authentication is handled by adminOnly middleware

    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { productId: id };

    const product = await Product.findOneAndUpdate(
      query,
      req.body,
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
      data: product
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

// @desc    Delete product (Admin only)
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    // Admin authentication is handled by adminOnly middleware

    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { productId: id };

    const product = await Product.findOneAndUpdate(
      query,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// @desc    Get product categories
// @route   GET /api/v1/products/categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

module.exports = router;