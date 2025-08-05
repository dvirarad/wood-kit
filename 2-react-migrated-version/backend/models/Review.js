const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  images: [{
    url: String,
    alt: String
  }],
  helpful: {
    count: { type: Number, default: 0 },
    users: [{ type: String }] // IP addresses or user IDs who found it helpful
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam'],
    default: 'pending'
  },
  language: {
    type: String,
    enum: ['en', 'he', 'es'],
    default: 'en'
  },
  metadata: {
    source: { type: String, default: 'website' },
    userAgent: String,
    ipAddress: String,
    orderReference: String // Link to order if customer purchased
  },
  moderationNotes: {
    type: String,
    maxlength: 500
  },
  replies: [{
    author: {
      name: String,
      role: { type: String, enum: ['admin', 'staff'], default: 'admin' }
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000
    },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ productId: 1, status: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ 'customer.email': 1 });

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Virtual for review age
reviewSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware for validation and sanitization
reviewSchema.pre('save', function(next) {
  // Sanitize text content (basic HTML stripping)
  if (this.text) {
    this.text = this.text.replace(/<[^>]*>/g, '').trim();
  }
  if (this.title) {
    this.title = this.title.replace(/<[^>]*>/g, '').trim();
  }

  // Auto-approve reviews from verified customers
  if (this.customer.verified && this.status === 'pending') {
    this.status = 'approved';
  }

  next();
});

// Post-save middleware to update product ratings
reviewSchema.post('save', async function(doc) {
  if (doc.status === 'approved') {
    await doc.updateProductRating();
  }
});

// Post-remove middleware to update product ratings
reviewSchema.post('remove', async function(doc) {
  await doc.updateProductRating();
});

// Instance method to update product rating
reviewSchema.methods.updateProductRating = async function() {
  const Review = this.constructor;
  const Product = mongoose.model('Product');

  try {
    // Calculate new average rating for approved reviews only
    const stats = await Review.aggregate([
      {
        $match: {
          product: this.product,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      const { averageRating, totalReviews } = stats[0];
      await Product.findByIdAndUpdate(this.product, {
        'ratings.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
        'ratings.count': totalReviews
      });
    } else {
      // No approved reviews, reset to 0
      await Product.findByIdAndUpdate(this.product, {
        'ratings.average': 0,
        'ratings.count': 0
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

// Static method to get reviews for a product
reviewSchema.statics.getProductReviews = function(productId, options = {}) {
  const {
    status = 'approved',
    language = null,
    page = 1,
    limit = 10,
    sort = '-createdAt'
  } = options;

  const query = { productId, status };
  if (language) {
    query.language = language;
  }

  return this.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-metadata -moderationNotes');
};

// Static method to get review statistics
reviewSchema.statics.getReviewStats = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: {
        productId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const { averageRating, totalReviews, ratingDistribution } = stats[0];
  
  // Count distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    distribution
  };
};

// Instance method to add admin reply
reviewSchema.methods.addReply = function(text, authorName = 'Wood Kits Team') {
  this.replies.push({
    author: {
      name: authorName,
      role: 'admin'
    },
    text,
    timestamp: new Date()
  });
  return this.save();
};

// Instance method to mark as helpful
reviewSchema.methods.markHelpful = function(userIdentifier) {
  if (!this.helpful.users.includes(userIdentifier)) {
    this.helpful.users.push(userIdentifier);
    this.helpful.count++;
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Review', reviewSchema);