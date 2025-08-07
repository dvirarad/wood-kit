# Wood Kits E2E Test Suite

This directory contains comprehensive end-to-end tests for the Wood Kits e-commerce platform, specifically focusing on the admin product management functionality.

## Test Structure

### Backend API Tests (`e2e/admin-product-management.test.js`)

Tests the complete admin product management API endpoints:

**Authentication Tests:**
- Admin login authentication
- Token-based access control
- Unauthorized access prevention

**Basic Product Info Management:**
- Update product name with validation
- Update product description with validation
- Validate field length constraints
- Handle empty/invalid inputs

**Pricing & Dimensions Management:**
- Update base price with validation
- Update dimension configurations (min/max/default/multiplier)
- Validate price and dimension constraints
- Test negative value rejection

**Image Management:**
- Add/update/remove product images
- Set primary image designation
- Validate image URL formats
- Handle empty image arrays

**Complete Update Flow:**
- Test simultaneous updates of all product fields
- Verify database consistency
- Test partial updates

**Error Handling:**
- Non-existent product handling
- Invalid product ID formats
- Database constraint violations
- Validation error responses

**Integration Tests:**
- Price calculation with updated product data
- Admin dashboard product reflection
- Product listing updates

### Frontend E2E Tests (`e2e/admin-frontend.spec.js`)

Tests the complete admin UI workflow using Playwright:

**Navigation & Authentication:**
- Admin login flow
- Dashboard navigation
- Products page access

**Product List Management:**
- Display products table
- Product information presentation
- Edit button functionality

**Edit Dialog Functionality:**
- Dialog opening/closing
- Tab navigation (Basic Info, Pricing & Dimensions, Images)
- Form field interactions

**Basic Info Editing:**
- Product name editing
- Description editing
- Field validation
- Save/cancel functionality

**Pricing & Dimensions Editing:**
- Base price updates
- Dimension configuration changes
- Validation handling

**Image Management UI:**
- Add new images via URL
- Remove existing images
- Set primary image
- Image list display

**Form Behavior:**
- Tab navigation without data loss
- Form validation handling
- Cancel without saving
- Multiple sequential edits

**Responsive Design:**
- Mobile viewport testing
- Touch interaction compatibility
- Layout adaptation

## Test Data Management

### Test Product Creation
Each test suite creates isolated test products to avoid conflicts:
- Unique product IDs for each test run
- Cleanup after test completion
- Minimal test data pollution

### Database Isolation
- Uses MongoDB Memory Server for backend tests
- Separate test database instances
- Automatic cleanup between test runs

## Running the Tests

### Prerequisites
```bash
# Install dependencies
npm install
npm install --save-dev jest supertest mongodb-memory-server @playwright/test
```

### Backend API Tests
```bash
# Run all backend tests
npm run test:backend

# Run specific test file
npx jest tests/e2e/admin-product-management.test.js

# Run with coverage
npm run test:coverage
```

### Frontend E2E Tests
```bash
# Install Playwright browsers
npx playwright install

# Run all frontend tests
npm run test:e2e

# Run specific test file
npx playwright test admin-frontend.spec.js

# Run with UI mode
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium
```

### Full Test Suite
```bash
# Run all tests (backend + frontend)
npm run test:all
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Node.js test environment
- Setup files for database initialization
- Coverage reporting configuration
- Test file patterns

### Playwright Configuration (`playwright.config.js`)
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Local dev server startup
- Trace collection on failures

### Setup Files (`tests/setup.js`)
- MongoDB Memory Server initialization
- Environment variable configuration
- Global test timeouts
- Database connection management

## Test Coverage

The test suite covers:

### ✅ Functional Coverage
- Admin authentication flow
- Product CRUD operations
- Form validation
- Error handling
- Price calculation integration

### ✅ UI Coverage
- Component interactions
- Dialog management
- Tab navigation
- Responsive design
- Form behavior

### ✅ API Coverage
- All admin endpoints
- Request/response validation
- Database operations
- Error responses

### ✅ Integration Coverage
- Frontend ↔ Backend communication
- Database consistency
- Price calculation accuracy
- Admin workflow completion

## Test Data Scenarios

### Product Types Tested
- Bookshelves (Amsterdam, Venice)
- Custom stairs
- Garden furniture
- Pet products
- Planters

### Configuration Scenarios
- Minimum dimensions
- Maximum dimensions
- Custom multipliers
- Color options
- Image management

### Edge Cases
- Invalid inputs
- Network failures
- Authentication errors
- Concurrent updates
- Empty states

## Continuous Integration

### GitHub Actions Integration
```yaml
# Example workflow
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run backend tests
        run: npm run test:backend
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e
```

### Test Reports
- Jest coverage reports (HTML/LCOV)
- Playwright test reports (HTML)
- Screenshot/video capture on failures
- Performance metrics tracking

## Debugging Tests

### Backend Test Debugging
```bash
# Run with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Verbose output
npx jest --verbose

# Specific test debugging
npx jest --testNamePattern="should update product name"
```

### Frontend Test Debugging
```bash
# Run with browser visible
npx playwright test --headed

# Debug specific test
npx playwright test --debug admin-frontend.spec.js

# Record test execution
npx playwright test --video=on
```

### Common Issues
1. **Port conflicts**: Ensure no other services running on 3000/6003
2. **Database connections**: Check MongoDB memory server startup
3. **Timing issues**: Increase timeouts for slow operations
4. **Authentication**: Verify admin credentials configuration

## Contributing

### Adding New Tests
1. Follow existing test patterns
2. Use descriptive test names in Hebrew where appropriate
3. Include both positive and negative test cases
4. Add cleanup procedures for test data
5. Update this documentation

### Test Maintenance
- Regularly update test data
- Keep browser versions current
- Monitor test execution times
- Review and update assertions
- Maintain test isolation