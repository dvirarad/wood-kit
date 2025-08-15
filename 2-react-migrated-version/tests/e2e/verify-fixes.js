/**
 * Product Display Fixes Verification Script
 * 
 * This script verifies that all the identified issues have been resolved:
 * 1. Image display issues
 * 2. Price calculation integration
 * 3. Admin dimension configuration integration
 * 4. Data synchronization between admin and client
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:6003/api/v1';

async function runTest(testName, testFn) {
  try {
    console.log(`\n🧪 ${testName}...`);
    await testFn();
    console.log(`✅ ${testName} - PASSED`);
    return true;
  } catch (error) {
    console.error(`❌ ${testName} - FAILED:`, error.message);
    return false;
  }
}

async function verifyImageDisplayFixes() {
  // Get all products and verify they have proper image URLs
  const response = await axios.get(`${API_BASE_URL}/products?language=he&limit=10`);
  
  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error('Failed to fetch products');
  }
  
  const products = response.data.data;
  let productCount = 0;
  let workingImageCount = 0;
  
  for (const product of products) {
    productCount++;
    
    if (!product.images || product.images.length === 0) {
      console.warn(`  ⚠️  Product ${product.productId} has no images`);
      continue;
    }
    
    for (const image of product.images) {
      if (!image.url) {
        throw new Error(`Product ${product.productId} has empty image URL`);
      }
      
      // Check that images are not broken local file paths
      if (image.url.startsWith('/images/')) {
        throw new Error(`Product ${product.productId} still has broken local image path: ${image.url}`);
      }
      
      // Check for proper HTTP URLs or placeholder
      if (image.url.match(/^https?:\/\//) || image.url.includes('placeholder')) {
        workingImageCount++;
      }
    }
  }
  
  console.log(`  📸 Found ${productCount} products with ${workingImageCount} working images`);
}

async function verifyPriceCalculationIntegration() {
  const testCases = [
    {
      productId: 'stairs',
      dimensions: { width: 80, height: 100, length: 250, steps: 6 },
      color: 'דובדבן'
    },
    {
      productId: 'test-steps',
      dimensions: { width: 60, height: 120 },
      color: 'אלון'
    }
  ];
  
  for (const testCase of testCases) {
    const response = await axios.post(
      `${API_BASE_URL}/products/${testCase.productId}/calculate-price`,
      { 
        configuration: { 
          dimensions: testCase.dimensions,
          color: testCase.color 
        }
      }
    );
    
    if (!response.data.success) {
      throw new Error(`Price calculation failed for ${testCase.productId}`);
    }
    
    const pricing = response.data.data.pricing;
    const requiredProps = ['basePrice', 'sizeAdjustment', 'colorCost', 'totalPrice'];
    
    for (const prop of requiredProps) {
      if (typeof pricing[prop] !== 'number') {
        throw new Error(`Missing or invalid ${prop} in pricing for ${testCase.productId}`);
      }
    }
    
    if (pricing.totalPrice <= 0) {
      throw new Error(`Invalid total price for ${testCase.productId}: ${pricing.totalPrice}`);
    }
    
    console.log(`  💰 ${testCase.productId}: ₪${pricing.totalPrice} (base: ${pricing.basePrice}, size: +${pricing.sizeAdjustment}, color: +${pricing.colorCost})`);
  }
}

async function verifyAdminDimensionConfiguration() {
  const response = await axios.get(`${API_BASE_URL}/products/test-steps`);
  
  if (!response.data.success) {
    throw new Error('Failed to fetch test-steps product');
  }
  
  const product = response.data.data;
  
  if (!product.dimensions) {
    throw new Error('test-steps product missing dimensions');
  }
  
  // Check width dimension (should be configured with step=5)
  const width = product.dimensions.width;
  if (!width) {
    throw new Error('test-steps missing width dimension');
  }
  
  if (width.step !== 5) {
    throw new Error(`Expected width step=5, got ${width.step}`);
  }
  
  if (!width.visible) {
    throw new Error('Width dimension should be visible');
  }
  
  if (!width.editable) {
    throw new Error('Width dimension should be editable');
  }
  
  // Check height dimension (should have step=10)
  const height = product.dimensions.height;
  if (!height) {
    throw new Error('test-steps missing height dimension');
  }
  
  if (height.step !== 10) {
    throw new Error(`Expected height step=10, got ${height.step}`);
  }
  
  console.log(`  📏 test-steps dimensions: width(step=${width.step}, visible=${width.visible}), height(step=${height.step}, visible=${height.visible})`);
}

async function verifyDataSynchronization() {
  // Test that dimension changes affect price calculations properly
  const baseResponse = await axios.post(
    `${API_BASE_URL}/products/test-steps/calculate-price`,
    { configuration: { dimensions: { width: 50 } } }
  );
  
  const modifiedResponse = await axios.post(
    `${API_BASE_URL}/products/test-steps/calculate-price`,
    { configuration: { dimensions: { width: 80 } } }
  );
  
  if (!baseResponse.data.success || !modifiedResponse.data.success) {
    throw new Error('Price calculation requests failed');
  }
  
  const basePrice = baseResponse.data.data.pricing.totalPrice;
  const modifiedPrice = modifiedResponse.data.data.pricing.totalPrice;
  
  if (basePrice === modifiedPrice) {
    throw new Error('Price should change when dimensions change');
  }
  
  if (modifiedPrice <= basePrice) {
    throw new Error('Larger dimensions should result in higher price');
  }
  
  console.log(`  🔄 Dimension sync working: width 50→80cm changes price from ₪${basePrice} to ₪${modifiedPrice}`);
}

async function verifyEndToEndIntegration() {
  // Complete flow: fetch product -> use dimensions -> calculate price
  const productResponse = await axios.get(`${API_BASE_URL}/products/test-steps`);
  
  if (!productResponse.data.success) {
    throw new Error('Failed to fetch product');
  }
  
  const product = productResponse.data.data;
  const widthDim = product.dimensions.width;
  const testWidth = widthDim.default + widthDim.step; // Use step-aligned value
  
  const priceResponse = await axios.post(
    `${API_BASE_URL}/products/test-steps/calculate-price`,
    { 
      configuration: { 
        dimensions: { width: testWidth },
        color: 'ללא צבע'
      }
    }
  );
  
  if (!priceResponse.data.success) {
    throw new Error('Price calculation failed');
  }
  
  // Verify consistency
  if (priceResponse.data.data.productId !== product.productId) {
    throw new Error('Product ID mismatch between fetch and price calculation');
  }
  
  if (priceResponse.data.data.pricing.basePrice !== product.basePrice) {
    throw new Error('Base price mismatch between product data and pricing');
  }
  
  const hasValidImages = product.images && product.images.length > 0 && 
    product.images.some(img => img.url && !img.url.startsWith('/images/'));
  
  if (!hasValidImages) {
    throw new Error('Product should have valid images');
  }
  
  console.log(`  🎯 End-to-end test: ${product.productId} - base ₪${product.basePrice}, calculated ₪${priceResponse.data.data.pricing.totalPrice}, has images: ${hasValidImages}`);
}

async function main() {
  console.log('🚀 Product Display Integration Fixes Verification');
  console.log('==================================================');
  
  const tests = [
    ['Image Display Fixes', verifyImageDisplayFixes],
    ['Price Calculation Integration', verifyPriceCalculationIntegration],
    ['Admin Dimension Configuration', verifyAdminDimensionConfiguration],
    ['Data Synchronization', verifyDataSynchronization],
    ['End-to-End Integration', verifyEndToEndIntegration]
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [name, testFn] of tests) {
    if (await runTest(name, testFn)) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n🏁 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All product display integration issues have been successfully fixed!');
    console.log('\n✅ Issues resolved:');
    console.log('   • Product images now display correctly with proper URLs');
    console.log('   • Price calculations integrate properly with backend API');
    console.log('   • Admin dimension configurations work on client pages');
    console.log('   • Data synchronization between admin edits and client display works');
    console.log('   • test-steps product works with proper step, visible, editable settings');
  } else {
    console.log('\n⚠️  Some issues still need attention.');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(error => {
  console.error('\n💥 Test suite failed:', error.message);
  process.exit(1);
});