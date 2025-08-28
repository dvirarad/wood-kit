const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/woodkits')
.then(() => {
  console.log('✅ Connected to MongoDB');
  updateProducts();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  process.exit(1);
});

async function updateProducts() {
  try {
    // Import Product model
    const Product = require('../models/Product');
    
    // Find all products that don't have minimumPrice
    const productsToUpdate = await Product.find({ 
      $or: [
        { minimumPrice: { $exists: false } },
        { minimumPrice: null },
        { minimumPrice: 0 }
      ]
    });
    
    console.log(`📦 Found ${productsToUpdate.length} products to update`);
    
    for (const product of productsToUpdate) {
      // Set minimumPrice to 80% of basePrice as a reasonable default
      const minimumPrice = Math.round(product.basePrice * 0.8);
      
      await Product.findByIdAndUpdate(product._id, {
        minimumPrice: minimumPrice
      });
      
      console.log(`✅ Updated product ${product.productId}: minimumPrice = ₪${minimumPrice} (was basePrice: ₪${product.basePrice})`);
    }
    
    console.log(`🎉 Successfully updated ${productsToUpdate.length} products`);
    
  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}