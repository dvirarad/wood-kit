const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class SystemVerifier {
  constructor() {
    this.results = {
      database: { status: 'pending', details: [] },
      backend: { status: 'pending', details: [] },
      frontend: { status: 'pending', details: [] },
      products: { status: 'pending', details: [] },
      api: { status: 'pending', details: [] }
    };
  }

  log(category, message, success = true) {
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${message}`);
    this.results[category].details.push({ message, success });
  }

  async checkDatabase() {
    console.log('\n🗄️  Checking Database Connection...');
    try {
      const mongoose = require('./backend/node_modules/mongoose');
      require('dotenv').config({ path: './backend/.env' });
      
      await mongoose.connect(process.env.MONGODB_URI);
      this.log('database', 'Connected to MongoDB successfully');
      
      const Product = require('./backend/models/Product');
      const productCount = await Product.countDocuments();
      this.log('database', `Found ${productCount} products in database`, productCount > 0);
      
      if (productCount === 0) {
        this.log('database', 'Database is empty - run "npm run seed" in backend/', false);
      }
      
      await mongoose.connection.close();
      this.results.database.status = productCount > 0 ? 'success' : 'warning';
      
    } catch (error) {
      this.log('database', `Database connection failed: ${error.message}`, false);
      this.results.database.status = 'error';
    }
  }

  async checkBackend() {
    console.log('\n🖥️  Checking Backend Server...');
    try {
      const response = await axios.get('http://localhost:6003/health', { timeout: 5000 });
      this.log('backend', 'Backend server is running on port 6003');
      this.log('backend', `Server status: ${response.data.message}`);
      this.results.backend.status = 'success';
    } catch (error) {
      this.log('backend', 'Backend server is not running on port 6003', false);
      this.log('backend', 'Run "npm start" in backend/ directory', false);
      this.results.backend.status = 'error';
    }
  }

  async checkFrontend() {
    console.log('\n🌐 Checking Frontend Configuration...');
    try {
      const envPath = './frontend/.env';
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const hasApiUrl = envContent.includes('REACT_APP_API_URL=http://localhost:6003/api/v1');
        const hasPort = envContent.includes('PORT=6005');
        
        this.log('frontend', 'Frontend .env file exists');
        this.log('frontend', 'API URL configured correctly', hasApiUrl);
        this.log('frontend', 'Frontend port set to 6005', hasPort);
        
        this.results.frontend.status = hasApiUrl && hasPort ? 'success' : 'warning';
      } else {
        this.log('frontend', 'Frontend .env file missing', false);
        this.results.frontend.status = 'error';
      }

      // Check if frontend is running
      try {
        await axios.get('http://localhost:6005', { timeout: 3000 });
        this.log('frontend', 'Frontend is running on port 6005');
      } catch {
        this.log('frontend', 'Frontend is not running - run "npm start" in frontend/', false);
      }

    } catch (error) {
      this.log('frontend', `Frontend check failed: ${error.message}`, false);
      this.results.frontend.status = 'error';
    }
  }

  async checkProducts() {
    console.log('\n📦 Checking Products API...');
    try {
      const response = await axios.get('http://localhost:6003/api/v1/products', { timeout: 5000 });
      const products = response.data.data;
      
      this.log('products', `Products API returned ${products.length} products`);
      
      const expectedProducts = [
        'amsterdam-bookshelf',
        'venice-bookshelf', 
        'stairs',
        'garden-bench',
        'wooden-planter',
        'dog-bed'
      ];

      expectedProducts.forEach(productId => {
        const found = products.find(p => p.productId === productId);
        this.log('products', `${productId}: ${found ? 'found' : 'missing'}`, !!found);
      });

      this.results.products.status = products.length === expectedProducts.length ? 'success' : 'warning';

    } catch (error) {
      this.log('products', `Products API failed: ${error.message}`, false);
      this.results.products.status = 'error';
    }
  }

  async checkAPI() {
    console.log('\n🔌 Checking API Endpoints...');
    const endpoints = [
      { url: '/products', name: 'List products' },
      { url: '/products/amsterdam-bookshelf', name: 'Get specific product' },
      { url: '/reviews', name: 'List reviews' }
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`http://localhost:6003/api/v1${endpoint.url}`, { timeout: 5000 });
        this.log('api', `${endpoint.name}: Working`);
        successCount++;
      } catch (error) {
        this.log('api', `${endpoint.name}: Failed (${error.response?.status || error.message})`, false);
      }
    }

    // Test price calculation
    try {
      const response = await axios.post('http://localhost:6003/api/v1/products/amsterdam-bookshelf/calculate-price', {
        dimensions: { height: 200, width: 100, depth: 35 },
        options: { lacquer: true, handrail: false }
      }, { timeout: 5000 });
      
      this.log('api', `Price calculation: ₪${response.data.data.totalPrice}`);
      successCount++;
    } catch (error) {
      this.log('api', `Price calculation: Failed`, false);
    }

    this.results.api.status = successCount === endpoints.length + 1 ? 'success' : 'warning';
  }

  printSummary() {
    console.log('\n📊 SYSTEM VERIFICATION SUMMARY');
    console.log('================================');
    
    Object.entries(this.results).forEach(([category, result]) => {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${category.toUpperCase()}: ${result.status.toUpperCase()}`);
    });

    const overallStatus = Object.values(this.results).every(r => r.status === 'success') ? 'SUCCESS' :
                         Object.values(this.results).some(r => r.status === 'error') ? 'ISSUES FOUND' : 'WARNINGS';

    console.log('\n' + '='.repeat(40));
    console.log(`🎯 OVERALL STATUS: ${overallStatus}`);
    console.log('='.repeat(40));

    if (overallStatus === 'SUCCESS') {
      console.log('\n🎉 Everything is working perfectly!');
      console.log('   • Visit: http://localhost:6005');
      console.log('   • API: http://localhost:6003/api/v1/products');
    } else {
      console.log('\n🔧 Action Required:');
      Object.entries(this.results).forEach(([category, result]) => {
        if (result.status !== 'success') {
          result.details.filter(d => !d.success).forEach(detail => {
            console.log(`   • ${detail.message}`);
          });
        }
      });
    }
  }

  async runAll() {
    console.log('🔍 Wood Kits System Verification');
    console.log('=================================');
    
    await this.checkDatabase();
    await this.checkBackend();
    await this.checkFrontend();
    await this.checkProducts();
    await this.checkAPI();
    
    this.printSummary();
  }
}

// Run verification
const verifier = new SystemVerifier();
verifier.runAll().catch(error => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
});