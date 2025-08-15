// Quick script to update broken image URLs in the database
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/woodkits', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

const imageUpdates = {
  'amsterdam-bookshelf': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300',
  'venice-bookshelf': 'https://images.unsplash.com/photo-1503602642458-232111445657?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300',
  'stairs': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300'
};

async function fixImages() {
  try {
    console.log('🔧 Fixing broken image URLs...');
    
    for (const [productId, newImageUrl] of Object.entries(imageUpdates)) {
      const result = await Product.updateOne(
        { productId: productId },
        { 
          $set: { 
            'images.0.url': newImageUrl 
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${productId} image`);
      } else {
        console.log(`⚠️  ${productId} not found or already updated`);
      }
    }
    
    console.log('🎉 Image fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing images:', error);
    process.exit(1);
  }
}

fixImages();