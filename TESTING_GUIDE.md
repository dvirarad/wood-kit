# 🧪 Wood Kits - Comprehensive Testing Guide

## 🎯 Testing Strategy Overview

This project includes a complete CI/CD ready testing suite covering:

- **Unit Tests** - Individual component and function testing
- **Integration Tests** - Backend/Frontend service interaction
- **E2E Tests** - Happy flow user journey automation  
- **Performance Tests** - Response time and load validation
- **Security Tests** - Vulnerability scanning and validation

---

## 🚀 Quick Start

### **Run All Tests**
```bash
cd /Users/arad/dev/kits-wood/2-react-migrated-version
chmod +x run-tests.sh
./run-tests.sh
```

### **Run Specific Test Types**
```bash
./run-tests.sh unit           # Unit tests only
./run-tests.sh integration    # Integration tests only  
./run-tests.sh e2e           # E2E happy flow tests only
./run-tests.sh performance   # Performance tests only
```

### **CI Mode (for GitHub Actions)**
```bash
./run-tests.sh all true      # CI mode with no interactive prompts
```

---

## 📋 Test Coverage

### **1. Unit Tests**

#### **Frontend Tests** (`frontend/src/App.test.tsx`)
- ✅ Component rendering
- ✅ Navigation functionality
- ✅ Cart operations
- ✅ Language switching
- ✅ Theme integration
- ✅ Context providers

**Run Frontend Tests:**
```bash
cd frontend
npm test
```

#### **Backend Tests** (`backend/__tests__/server.test.js`)
- ✅ API endpoints
- ✅ Health checks
- ✅ CORS configuration
- ✅ Security headers
- ✅ Request validation
- ✅ Error handling

**Run Backend Tests:**
```bash
cd backend
npm test
```

### **2. Integration Tests** (`test-suite.sh`)

Comprehensive system integration testing:
- ✅ Environment setup validation
- ✅ Backend startup and health
- ✅ Frontend build and startup
- ✅ API endpoint connectivity
- ✅ Frontend-Backend integration
- ✅ Performance benchmarks

**Phases Covered:**
1. Environment Setup
2. Backend Tests
3. Frontend Tests  
4. Integration Tests
5. Happy Flow UI Tests
6. Performance Tests
7. Results Summary

### **3. E2E Happy Flow Tests** (`e2e-tests.js`)

User journey automation covering:
- ✅ Product catalog loading
- ✅ Product detail access
- ✅ Price calculation
- ✅ Order creation flow
- ✅ Frontend loading
- ✅ Frontend-Backend API integration
- ✅ Multi-language support

**Happy Flows Tested:**
1. **Browse Products**: User views product catalog
2. **Product Details**: User accesses specific product
3. **Configure Product**: User customizes dimensions/options  
4. **Calculate Price**: System calculates real-time pricing
5. **Add to Cart**: User adds configured product to cart
6. **Checkout**: User completes order process
7. **Language Switch**: User changes interface language

### **4. Performance Tests**

Response time validation:
- ✅ Backend API response < 2 seconds
- ✅ Frontend page load < 3 seconds
- ✅ Database query performance
- ✅ Asset loading optimization

---

## 🔧 CI/CD Integration

### **GitHub Actions** (`.github/workflows/ci-cd.yml`)

**Workflow Stages:**
1. **Test Matrix**: Node.js 18.x and 20.x
2. **Unit Tests**: Frontend and Backend
3. **Integration Tests**: Full system validation
4. **Security Audit**: Vulnerability scanning
5. **E2E Tests**: Happy flow automation
6. **Build & Deploy**: Production artifacts
7. **Notifications**: Success/failure alerts

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

**Services:**
- MongoDB 5.0 for testing
- Node.js test matrix
- Artifact uploads
- Security scanning

### **Environment Variables**
```bash
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/woodkits_test
PORT=5001
CI=true
```

---

## 🎭 Happy Flow Test Scenarios

### **Scenario 1: New Customer Journey**
1. Customer visits homepage
2. Views product catalog (6 products)
3. Selects Amsterdam Bookshelf
4. Configures dimensions (180cm x 80cm)
5. Adds lacquer finish option
6. Sees price update (₪244)
7. Adds to cart
8. Proceeds to checkout
9. Fills customer information
10. Submits order successfully

### **Scenario 2: Multi-Language Experience**
1. Customer visits in English
2. Switches to Hebrew (RTL layout)
3. Browses products in Hebrew
4. Switches to Spanish
5. Completes purchase in Spanish
6. Receives confirmation in selected language

### **Scenario 3: Product Configuration**
1. Customer selects Custom Stairs
2. Adjusts length: 250cm
3. Adjusts width: 80cm  
4. Adjusts height: 100cm
5. Adds handrail option
6. Sees real-time price updates
7. Compares with other products
8. Makes final purchase decision

---

## 📊 Test Metrics

### **Coverage Targets**
- **Frontend**: >80% code coverage
- **Backend**: >75% code coverage
- **E2E**: 100% happy flow coverage
- **Integration**: All API endpoints

### **Performance Benchmarks**
- **Backend Response**: <2 seconds
- **Frontend Load**: <3 seconds
- **Database Queries**: <500ms
- **Build Time**: <5 minutes

### **Quality Gates**
- All unit tests must pass
- Integration tests must pass
- No high-severity security vulnerabilities
- Performance benchmarks met
- TypeScript compilation clean

---

## 🛠️ Test Development

### **Adding New Tests**

#### **Frontend Unit Test**
```typescript
// frontend/src/components/__tests__/NewComponent.test.tsx
import { render, screen } from '@testing-library/react';
import NewComponent from '../NewComponent';

test('renders component correctly', () => {
  render(<NewComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

#### **Backend Unit Test**
```javascript
// backend/__tests__/newEndpoint.test.js
const request = require('supertest');
const app = require('../server');

test('POST /api/v1/new-endpoint', async () => {
  const response = await request(app)
    .post('/api/v1/new-endpoint')
    .send({ data: 'test' })
    .expect(200);
    
  expect(response.body).toHaveProperty('success', true);
});
```

#### **E2E Test**
```javascript
// Add to e2e-tests.js
async testNewHappyFlow() {
  // Test implementation
  const response = await axios.get(`${API_URL}/new-endpoint`);
  if (response.status !== 200) {
    throw new Error('New happy flow failed');
  }
}
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### **Tests Failing**
```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json
npm install

# Check specific test
npm test -- --verbose
```

#### **Integration Test Issues**
```bash
# Check services are running
curl http://localhost:6003/health
curl http://localhost:6005

# Clear ports
lsof -ti:6003 | xargs kill -9
lsof -ti:6005 | xargs kill -9
```

#### **E2E Test Failures**
```bash
# Increase timeout for slow systems
export E2E_TIMEOUT=30000

# Check API connectivity
curl http://localhost:6003/api/v1/products
```

---

## 🎉 Success Criteria

### **All Tests Passing**
```
🎉 ALL TESTS PASSED!
===================
✅ Unit Tests: PASSED
✅ Integration Tests: PASSED  
✅ E2E Tests: PASSED
✅ Performance Tests: PASSED
✅ Security Tests: PASSED

🌟 System is ready for production deployment!
```

### **Ready for Deployment**
- All test suites green
- No security vulnerabilities
- Performance benchmarks met
- CI/CD pipeline successful
- Artifacts generated

---

## 📈 Continuous Improvement

### **Test Automation Enhancement**
- Visual regression testing
- Load testing with artillery
- Mobile device testing
- Accessibility testing
- Cross-browser validation

### **Monitoring Integration**
- Test result dashboards
- Performance trend tracking
- Error rate monitoring
- User journey analytics

**This testing suite ensures Wood Kits is production-ready with comprehensive quality assurance!**