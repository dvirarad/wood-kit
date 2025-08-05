# Wood Kits - React Migrated Version

A modern, full-stack e-commerce platform for custom wood furniture built with React + TypeScript frontend and Node.js + Express backend.

## 🏗️ Architecture

**Modern Full-Stack Application**

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express + MongoDB
- **Database**: MongoDB with Mongoose ODM
- **State Management**: React Context API
- **API**: RESTful API with comprehensive validation
- **Payments**: Stripe integration
- **Email**: SendGrid integration
- **Authentication**: Simple admin session-based auth

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

```bash
cd 2-react-migrated-version
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI, admin credentials, etc.

# Start backend server
npm run dev
```

✅ Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend (new terminal)
cd frontend

# Install dependencies  
npm install

# Setup environment
# .env file already configured for local development

# Start React development server
npm start
```

✅ Frontend runs on `http://localhost:3000`

**Troubleshooting**: If you get "Cannot find module '../scripts/start'" error:
```bash
# Option 1: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Option 2: Use npx directly
npx react-scripts start

# Option 3: Install react-scripts globally
npm install -g react-scripts
react-scripts start
```

### Database Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create cluster and get connection string
3. Update `MONGODB_URI` in `backend/.env`

## 🎯 Features

### Frontend Features
- ✅ Modern React 18 + TypeScript architecture
- ✅ Material-UI design system with custom theming
- ✅ Responsive design (mobile-first approach)
- ✅ Product configuration with real-time API pricing
- ✅ Shopping cart with Context API state management
- ✅ Multi-language support with RTL for Hebrew
- ✅ Interactive product customization (sliders, checkboxes)
- ✅ Complete checkout flow with form validation
- ✅ Loading states and comprehensive error handling
- ✅ TypeScript interfaces for type safety

### Backend API Features
- ✅ RESTful API architecture
- ✅ MongoDB integration with Mongoose ODM
- ✅ Comprehensive input validation with Joi
- ✅ Error handling and logging middleware
- ✅ Simple admin authentication (username/password)
- ✅ Email integration with SendGrid
- ✅ Payment processing with Stripe
- ✅ Multi-language database support
- ✅ Order management with status tracking
- ✅ Product review system with moderation

### Supported Products
- 📚 **Bookshelves**: Amsterdam & Venice styles
- 🪜 **Custom Stairs**: With optional handrail
- 🪑 **Garden Bench**: Outdoor furniture
- 🌱 **Wooden Planter**: Garden accessories  
- 🐕 **Dog Bed**: Pet furniture

All products support:
- Custom dimensions (length, width, height, etc.)
- Optional lacquer finish
- Real-time pricing calculation
- Multi-language names and descriptions

## 📁 Project Structure

```
2-react-migrated-version/
├── 📁 frontend/                # React Frontend
│   ├── 📁 public/             # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/     # React components
│   │   │   ├── 📁 Cart/       # Cart drawer component
│   │   │   └── 📁 Layout/     # Header, Footer
│   │   ├── 📁 context/        # React Context for state
│   │   ├── 📁 pages/          # Page components
│   │   ├── 📁 services/       # API and translation services
│   │   ├── App.tsx            # Main App component
│   │   └── index.tsx          # React entry point
│   ├── package.json           # Frontend dependencies
│   ├── .env                   # Frontend environment variables
│   └── tsconfig.json          # TypeScript configuration
├── 📁 backend/                # Node.js Backend
│   ├── 📁 middleware/         # Auth, validation, error handling
│   ├── 📁 models/             # MongoDB schemas
│   ├── 📁 routes/             # API endpoints
│   ├── 📁 services/           # Business logic (email, payments)
│   ├── 📁 validation/         # Joi validation schemas
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment template
└── README.md                  # This file
```

## 🔌 API Endpoints

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID  
- `POST /api/v1/products/:id/calculate-price` - Calculate custom price

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders/:id` - Get order by ID
- `PUT /api/v1/orders/:id/status` - Update order status (Admin)

### Reviews
- `GET /api/v1/reviews` - Get approved reviews
- `POST /api/v1/reviews` - Submit new review
- `PUT /api/v1/reviews/:id/moderate` - Moderate review (Admin)

### Admin
- `POST /api/v1/admin/login` - Admin login
- `GET /api/v1/admin/dashboard` - Admin dashboard data

### Payments (Stripe)
- `POST /api/v1/payments/create-intent` - Create payment intent
- `POST /api/v1/payments/webhook` - Stripe webhook handler

### Email (SendGrid)
- `POST /api/v1/email/send` - Send email (Admin)
- `POST /api/v1/email/test` - Test email configuration

## ⚙️ Environment Configuration

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/woodkits

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=info@woodkits.com

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Homepage loads and displays products
- [ ] Language switching works (EN/HE/ES) with RTL
- [ ] Product pages load with configuration options
- [ ] Price updates in real-time via API
- [ ] Add to cart functionality works
- [ ] Cart page shows items and checkout form
- [ ] Order submission creates order in MongoDB
- [ ] Admin login works
- [ ] Responsive design on mobile/tablet

### API Testing
```bash
# Test product endpoint
curl http://localhost:5000/api/v1/products

# Test price calculation
curl -X POST http://localhost:5000/api/v1/products/stairs/calculate-price \
  -H "Content-Type: application/json" \
  -d '{"dimensions":{"length":200,"width":80},"options":{"lacquer":true}}'
```

## 🚀 Production Deployment

### Backend Deployment
- Use PM2 for process management
- Set up Nginx reverse proxy
- Use MongoDB Atlas for database
- Configure environment variables
- Enable HTTPS with Let's Encrypt

### Frontend Deployment
- Build: `npm run build`
- Deploy to: Netlify, Vercel, or AWS S3 + CloudFront
- Update `REACT_APP_API_URL` for production API

## 🔧 Development

### Adding New Features
1. **Backend**: Add routes, models, validation
2. **Frontend**: Create components, update types
3. **API Integration**: Update apiService.ts
4. **Testing**: Test both frontend and backend

### Code Style
- TypeScript for type safety
- Material-UI for consistent design
- ESLint/Prettier for code formatting
- Joi for API validation

## 🌐 Multi-Language Support

- **Frontend**: React-based translation service
- **Backend**: Multi-language product data in MongoDB
- **RTL Support**: Complete right-to-left layout for Hebrew
- **Fallbacks**: Graceful fallback to English if translation missing

## 📊 Key Differences from Standalone Version

| Feature | Standalone | React Migrated |
|---------|------------|----------------|
| **Frontend** | HTML/CSS/JS | React + TypeScript |
| **State Management** | localStorage | React Context API |
| **Data Storage** | localStorage | MongoDB Database |
| **API** | None | Full REST API |
| **Pricing** | Local calculation | Real-time API |
| **Orders** | localStorage | Database + Email |
| **Authentication** | None | Admin session |
| **Payments** | None | Stripe integration |
| **Scalability** | Limited | Production ready |

---

**Perfect for:** Production e-commerce applications, scalable businesses, complex product catalogs, integrated payment/email systems.