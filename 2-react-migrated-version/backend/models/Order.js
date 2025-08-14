const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  configuration: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      depth: Number,
      steps: Number
    },
    color: String,
    options: {
      lacquer: { type: Boolean, default: false },
      handrail: { type: Boolean, default: false }
    },
    customization: {
      personalizedMessage: String
    }
  },
  pricing: {
    basePrice: { type: Number, required: true },
    sizeAdjustment: { type: Number, default: 0 },
    colorCost: { type: Number, default: 0 },
    optionsCost: { type: Number, default: 0 },
    unitPrice: { type: Number, required: true }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^[\+]?[0-9\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  address: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(address) {
        if (typeof address === 'string') {
          return address.trim().length > 0 && address.length <= 500;
        }
        if (typeof address === 'object' && address !== null) {
          return address.street && address.city;
        }
        return false;
      },
      message: 'Address must be a string or object with street and city'
    }
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'WK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  customer: {
    type: customerSchema,
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 0.17, // 17% VAT in Israel
      min: 0,
      max: 1
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  currency: {
    type: String,
    default: 'NIS',
    enum: ['NIS', 'USD', 'EUR']
  },
  status: {
    type: String,
    enum: [
      'pending',     // Order created, awaiting payment
      'confirmed',   // Payment confirmed, processing
      'processing',  // Being manufactured
      'ready',       // Ready for pickup/delivery
      'shipped',     // Shipped/in delivery
      'delivered',   // Successfully delivered
      'cancelled',   // Cancelled by customer/admin
      'refunded'     // Refunded
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'cash', 'paypal'],
    default: 'credit_card'
  },
  paymentDetails: {
    transactionId: String,
    paymentProvider: String,
    paymentDate: Date
  },
  notes: {
    customer: {
      type: String,
      maxlength: 1000,
      trim: true
    },
    admin: {
      type: String,
      maxlength: 1000,
      trim: true
    }
  },
  shipping: {
    method: {
      type: String,
      enum: ['pickup', 'delivery', 'courier'],
      default: 'delivery'
    },
    address: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    trackingNumber: String
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: String
  }],
  metadata: {
    source: { type: String, default: 'website' },
    userAgent: String,
    ipAddress: String,
    language: { type: String, default: 'en' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
// Note: orderId already has unique index from schema definition
orderSchema.index({ status: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

// Pre-save middleware to calculate totals and add timeline entry
orderSchema.pre('save', function(next) {
  // Calculate totals
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.pricing.tax = this.pricing.subtotal * this.pricing.taxRate;
  this.pricing.total = this.pricing.subtotal + this.pricing.tax + this.pricing.shipping - this.pricing.discount;
  
  // Round to 2 decimal places
  this.pricing.subtotal = Math.round(this.pricing.subtotal * 100) / 100;
  this.pricing.tax = Math.round(this.pricing.tax * 100) / 100;
  this.pricing.total = Math.round(this.pricing.total * 100) / 100;

  // Add timeline entry if status changed
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status changed to ${this.status}`
    });
  }

  next();
});

// Virtual for formatted order ID
orderSchema.virtual('formattedId').get(function() {
  return this.orderId;
});

// Virtual for total items count
orderSchema.virtual('itemsCount').get(function() {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// Instance method to add timeline entry
orderSchema.methods.addTimelineEntry = function(status, note = '', updatedBy = 'system') {
  this.timeline.push({
    status,
    timestamp: new Date(),
    note,
    updatedBy
  });
  return this.save();
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find orders by customer email
orderSchema.statics.findByCustomerEmail = function(email) {
  return this.find({ 'customer.email': email.toLowerCase() }).sort({ createdAt: -1 });
};

// Instance method to get order summary
orderSchema.methods.getSummary = function() {
  return {
    id: this._id,
    orderId: this.orderId,
    customerName: this.customer.name,
    customerEmail: this.customer.email,
    itemsCount: this.itemsCount,
    total: this.pricing.total,
    currency: this.currency,
    status: this.status,
    paymentStatus: this.paymentStatus,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Order', orderSchema);