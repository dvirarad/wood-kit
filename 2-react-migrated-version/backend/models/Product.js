const mongoose = require('mongoose');

const dimensionSchema = new mongoose.Schema({
  min: {
    type: Number,
    required: true,
    min: 0
  },
  max: {
    type: Number,
    required: true,
    min: 0
  },
  default: {
    type: Number,
    required: true,
    min: 0
  },
  multiplier: {
    type: Number,
    required: true,
    min: 0
  },
  visible: {
    type: Boolean,
    default: true
  },
  editable: {
    type: Boolean,
    default: true
  },
  label: {
    en: { type: String, default: '' },
    he: { type: String, default: '' },
    es: { type: String, default: '' }
  }
}, { _id: false });

const translationSchema = new mongoose.Schema({
  en: { type: String, required: true },
  he: { type: String, required: true },
  es: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: translationSchema,
  description: translationSchema,
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NIS',
    enum: ['NIS', 'USD', 'EUR']
  },
  dimensions: {
    length: dimensionSchema,
    width: dimensionSchema,
    height: dimensionSchema,
    depth: dimensionSchema,
    steps: dimensionSchema
  },
  options: {
    lacquer: {
      available: { type: Boolean, default: true },
      price: { type: Number, default: 0 }
    },
    handrail: {
      available: { type: Boolean, default: false },
      price: { type: Number, default: 0 }
    }
  },
  colorOptions: {
    enabled: { type: Boolean, default: true },
    priceModifier: { type: Number, default: 0.4 }, // 40% increase by default
    options: [{
      name: {
        en: { type: String, required: true },
        he: { type: String, required: true },
        es: { type: String, required: true }
      },
      value: { type: String, required: true }, // color code or identifier
      priceAdjustment: { type: Number, default: 0 }, // individual price adjustment
      available: { type: Boolean, default: true }
    }]
  },
  category: {
    type: String,
    required: true,
    enum: ['bookshelf', 'stairs', 'furniture', 'outdoor', 'pet']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  inventory: {
    inStock: { type: Boolean, default: true },
    stockLevel: { type: Number, default: 100 },
    lowStockThreshold: { type: Number, default: 10 }
  },
  seo: {
    metaTitle: translationSchema,
    metaDescription: translationSchema,
    slug: {
      en: { type: String, unique: true, sparse: true },
      he: { type: String, unique: true, sparse: true },
      es: { type: String, unique: true, sparse: true }
    }
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
// Note: productId already has unique index from schema definition
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

// Pre-save middleware to update ratings
productSchema.pre('save', function(next) {
  // Ensure dimensions are valid
  if (this.dimensions) {
    Object.keys(this.dimensions).forEach(key => {
      const dim = this.dimensions[key];
      if (dim && dim.min > dim.max) {
        const error = new Error(`Invalid dimension range for ${key}: min (${dim.min}) cannot be greater than max (${dim.max})`);
        return next(error);
      }
      if (dim && (dim.default < dim.min || dim.default > dim.max)) {
        const error = new Error(`Invalid default value for ${key}: ${dim.default} must be between ${dim.min} and ${dim.max}`);
        return next(error);
      }
    });
  }
  next();
});

// Static method to calculate price
productSchema.statics.calculatePrice = function(basePrice, dimensions, selectedDimensions, options = {}, colorOptions = {}, selectedColor = null) {
  let totalPrice = basePrice;

  // Calculate size adjustments
  let sizeAdjustment = 0;
  if (dimensions && selectedDimensions) {
    Object.keys(selectedDimensions).forEach(key => {
      if (dimensions[key] && typeof selectedDimensions[key] === 'number') {
        const difference = selectedDimensions[key] - dimensions[key].default;
        sizeAdjustment += difference * dimensions[key].multiplier;
      }
    });
  }

  totalPrice += sizeAdjustment;

  // Add option costs (lacquer, handrail, etc.)
  let optionsCost = 0;
  if (options.lacquer) {
    optionsCost += 45; // Default lacquer price
  }
  if (options.handrail) {
    optionsCost += 120; // Default handrail price
  }

  // Calculate color cost
  let colorCost = 0;
  if (selectedColor && colorOptions && colorOptions.enabled) {
    if (selectedColor !== 'natural' && selectedColor !== 'ללא צבע') {
      const woodPriceAfterSize = totalPrice;
      colorCost = Math.round(woodPriceAfterSize * (colorOptions.priceModifier || 0.4));
      
      // Add individual color adjustment if specified
      if (colorOptions.options) {
        const colorOption = colorOptions.options.find(opt => opt.value === selectedColor);
        if (colorOption && colorOption.priceAdjustment) {
          colorCost += colorOption.priceAdjustment;
        }
      }
    }
  }

  totalPrice += optionsCost + colorCost;

  return {
    basePrice,
    sizeAdjustment: Math.round(sizeAdjustment * 100) / 100,
    optionsCost: Math.round(optionsCost * 100) / 100,
    colorCost: Math.round(colorCost * 100) / 100,
    totalPrice: Math.max(Math.round(totalPrice * 100) / 100, 0)
  };
};

// Instance method to get localized content
productSchema.methods.getLocalized = function(language = 'en') {
  const validLanguages = ['en', 'he', 'es'];
  const lang = validLanguages.includes(language) ? language : 'en';
  
  return {
    id: this._id,
    productId: this.productId,
    name: this.name[lang],
    description: this.description[lang],
    basePrice: this.basePrice,
    currency: this.currency,
    dimensions: this.dimensions,
    options: this.options,
    category: this.category,
    tags: this.tags,
    images: this.images,
    isActive: this.isActive,
    inventory: this.inventory,
    ratings: this.ratings,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Product', productSchema);