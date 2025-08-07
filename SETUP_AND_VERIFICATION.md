# Wood Kits System Setup and Verification Guide

## Complete System Setup

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
npm install axios --save-dev

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Database Setup

Make sure MongoDB is running on your system, then seed the database:

```bash
# Go to backend directory
cd backend

# Seed the database with all products
npm run seed

# Verify products were added
npm run seed:verify
```

Expected output from seeding:
```
🌱 Starting database seeding...

✅ MongoDB Connected: localhost:27017

📦 Seeding Products...
✅ Successfully seeded 6 products:
   - ספרייה אמסטרדם (amsterdam-bookshelf)
   - ספרייה ונציה (venice-bookshelf)
   - מדרגות מותאמות (stairs)
   - ספסל גינה (garden-bench)
   - עציץ עץ (wooden-planter)
   - מיטה לכלב (dog-bed)
```

### Step 3: Start the System

Open 2 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Step 4: Verify Admin Access

```bash
# Test admin API endpoints
cd backend
node scripts/verify-admin.js
```

## Complete Product List

The system includes 6 Hebrew wood products:

### 1. ספרייה אמסטרדם (Amsterdam Bookshelf)
- **Product ID**: `amsterdam-bookshelf`
- **Base Price**: ₪199
- **Dimensions**: Height (100-250cm), Width (60-120cm), Depth (25-40cm)
- **Options**: 9 colors, lacquer coating
- **Category**: Bookshelf

### 2. ספרייה ונציה (Venice Bookshelf)  
- **Product ID**: `venice-bookshelf`
- **Base Price**: ₪249
- **Dimensions**: Height (120-300cm), Width (70-140cm)
- **Options**: 9 colors, lacquer coating
- **Category**: Bookshelf

### 3. מדרגות מותאמות (Custom Stairs)
- **Product ID**: `stairs`
- **Base Price**: ₪299
- **Dimensions**: Length (150-400cm), Width (60-120cm), Height (50-150cm), Steps (3-12)
- **Options**: 9 colors, lacquer coating, handrail (₪120)
- **Category**: Stairs

### 4. ספסל גינה (Garden Bench)
- **Product ID**: `garden-bench`
- **Base Price**: ₪179
- **Dimensions**: Length (100-200cm), Width (30-50cm), Height (40-60cm)
- **Options**: 9 colors, lacquer coating
- **Category**: Outdoor

### 5. עציץ עץ (Wooden Planter)
- **Product ID**: `wooden-planter`
- **Base Price**: ₪89
- **Dimensions**: Length (40-120cm), Height (20-60cm)
- **Options**: 9 colors, lacquer coating
- **Category**: Outdoor

### 6. מיטה לכלב (Dog Bed)
- **Product ID**: `dog-bed`
- **Base Price**: ₪129
- **Dimensions**: Length (60-120cm), Width (40-80cm), Height (15-25cm)
- **Options**: 9 colors, lacquer coating
- **Category**: Pet

## Color Options Available

All products include 9 color choices with 35% markup:
1. **ללא צביעה** (No Paint) - 0% markup
2. **לבן** (White) - 35% markup
3. **שחור** (Black) - 35% markup  
4. **מייפל** (Maple) - 35% markup
5. **ירוק** (Green) - 35% markup
6. **אגוז כהה** (Dark Walnut) - 35% markup
7. **אדמדם** (Reddish) - 35% markup
8. **אלון** (Oak) - 35% markup
9. **אפור** (Gray) - 35% markup

## Admin Access Information

### Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Admin URLs
- **Login**: http://localhost:3000/admin/login
- **Dashboard**: http://localhost:3000/admin/dashboard
- **Product Management**: http://localhost:3000/admin/products

## Verification Commands

### 1. Check Database Products
```bash
cd backend
npm run seed:verify
```

### 2. Test Admin API Access
```bash
cd backend
node scripts/verify-admin.js
```

### 3. Test Frontend Build
```bash
cd frontend
npm run build
```

### 4. Run All Tests
```bash
# Backend tests
npm run test:backend

# Frontend E2E tests (requires browsers)
npm run test:e2e

# All tests
npm run test:all
```

## Admin Product Management Features

Once logged into the admin panel, you can:

### View All Products
- See complete product list in table format
- View base prices and dimension ranges
- See current product status (active/inactive)

### Edit Products (3-Tab Interface)
1. **Basic Info Tab** (מידע בסיסי):
   - Edit product names
   - Edit product descriptions
   
2. **Pricing & Dimensions Tab** (מחיר ומידות):
   - Adjust base prices
   - Configure dimension ranges (min/max/default)
   - Set price multipliers per centimeter
   
3. **Images Tab** (תמונות):
   - Add new product images via URL
   - Remove existing images  
   - Set primary image
   - Manage alt text for accessibility

### Save Changes
- All changes are validated in real-time
- Save button updates database immediately
- Success/error messages provided
- Changes reflect immediately in customer interface

## API Endpoints to Test

### Public Endpoints
```bash
# Get all products
curl http://localhost:6003/api/v1/products

# Get specific product
curl http://localhost:6003/api/v1/products/amsterdam-bookshelf

# Calculate price for configuration
curl -X POST http://localhost:6003/api/v1/products/amsterdam-bookshelf/calculate-price \
  -H "Content-Type: application/json" \
  -d '{"configuration":{"dimensions":{"height":200,"width":100,"depth":35},"options":{"color":"לבן","lacquer":true}}}'
```

### Admin Endpoints (require authentication)
```bash
# Login to get token
curl -X POST http://localhost:6003/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get products for admin (use token from login)
curl http://localhost:6003/api/v1/admin/pricing \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Update product
curl -X PUT http://localhost:6003/api/v1/admin/pricing/amsterdam-bookshelf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Updated Product Name","basePrice":250}'
```

## Troubleshooting

### Database Issues
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Restart MongoDB if needed
sudo systemctl restart mongod

# Re-seed database
cd backend
npm run seed
```

### Connection Issues
```bash
# Check if backend is running
curl http://localhost:6003/api/v1/products

# Check frontend is accessible
curl http://localhost:3000
```

### Admin Access Issues
```bash
# Verify admin credentials work
cd backend
node scripts/verify-admin.js

# Check admin token generation
curl -X POST http://localhost:6003/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Production Deployment Notes

Before deploying to production:

1. **Change Admin Credentials**:
   ```bash
   export ADMIN_USERNAME=your-secure-username
   export ADMIN_PASSWORD=your-secure-password
   ```

2. **Set Production Database**:
   ```bash
   export MONGODB_URI=mongodb://your-production-db:27017/wood-kits
   ```

3. **Configure CORS**:
   ```bash
   export CORS_ORIGIN=https://your-domain.com
   ```

4. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

5. **Test Production Build**:
   ```bash
   npm run test:all
   ```

## Success Indicators

✅ **Database seeded**: 6 products, multiple reviews, sample orders
✅ **Backend running**: Port 6003 accessible
✅ **Frontend running**: Port 3000 accessible  
✅ **Admin login working**: Can access admin dashboard
✅ **Product management**: Can view and edit products in admin
✅ **Color system**: All products have 9 color options
✅ **Pricing calculation**: Dynamic pricing working
✅ **Hebrew interface**: RTL layout working properly

The system is now fully operational with all products and admin functionality! 🎉