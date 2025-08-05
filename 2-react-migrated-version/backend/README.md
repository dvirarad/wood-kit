# Wood Kits Backend API

Node.js REST API backend for the Wood Kits e-commerce platform with custom furniture configuration.

## Features

- **Product Management**: CRUD operations for custom wood products
- **Order System**: Complete order lifecycle management with custom configurations
- **Authentication**: JWT-based admin authentication with role-based access
- **Email Integration**: SendGrid integration for order confirmations and notifications
- **Payment Processing**: Stripe integration for secure payments
- **Reviews System**: Customer review management with moderation
- **Multi-language Support**: English, Hebrew, and Spanish translations
- **Security**: Rate limiting, CORS, input validation, and security headers

## Installation

### Prerequisites

- Node.js (>=18.0.0)
- MongoDB (local or MongoDB Atlas)
- SendGrid account (for emails)
- Stripe account (for payments)

### Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/woodkits
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Admin credentials
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=change-this-password
   
   # SendGrid
   SENDGRID_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=info@woodkits.com
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

4. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas connection string

5. **Run the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products/:id/calculate-price` - Calculate custom price
- `POST /api/v1/products` - Create product (Admin)
- `PUT /api/v1/products/:id` - Update product (Admin)
- `DELETE /api/v1/products/:id` - Delete product (Admin)

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get orders (Admin)
- `GET /api/v1/orders/:id` - Get order by ID
- `PUT /api/v1/orders/:id/status` - Update order status (Admin)

### Reviews
- `GET /api/v1/reviews` - Get approved reviews
- `POST /api/v1/reviews` - Submit new review
- `PUT /api/v1/reviews/:id/moderate` - Moderate review (Admin)

### Authentication
- `POST /api/v1/admin/login` - Admin login

### Payments
- `POST /api/v1/payments/create-intent` - Create Stripe payment intent
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/webhook` - Stripe webhook handler

### Email
- `POST /api/v1/email/send` - Send email (Admin)
- `POST /api/v1/email/test` - Test email configuration

## Data Models

### Product Schema
```javascript
{
  productId: String,
  name: { en: String, he: String, es: String },
  description: { en: String, he: String, es: String },
  basePrice: Number,
  currency: String (default: 'NIS'),
  dimensions: {
    length: { min, max, default, multiplier },
    width: { min, max, default, multiplier },
    // ... other dimensions
  },
  options: {
    lacquer: { available: Boolean, price: Number },
    handrail: { available: Boolean, price: Number }
  },
  category: String,
  images: [{ url, alt, isPrimary }],
  isActive: Boolean
}
```

### Order Schema
```javascript
{
  orderId: String,
  customer: { name, email, phone, address },
  items: [{
    productId: String,
    quantity: Number,
    configuration: { dimensions, options }
  }],
  pricing: { subtotal, tax, adjustments, total },
  status: String,
  statusHistory: [{ status, timestamp, note }],
  payment: { method, status, stripePaymentIntentId },
  language: String
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes for general API, 5 requests per 15 minutes for auth
- **Input Validation**: Joi schema validation for all endpoints
- **JWT Authentication**: Secure token-based authentication
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Password Hashing**: bcryptjs for secure password storage

## Development

### Scripts
- `npm run dev` - Start with nodemon for development
- `npm start` - Start in production mode
- `npm test` - Run tests (when implemented)

### Project Structure
```
backend/
├── middleware/        # Authentication, validation, error handling
├── models/           # MongoDB schemas
├── routes/           # API route handlers
├── services/         # Business logic (email, payment)
├── validation/       # Joi validation schemas
├── server.js         # Main application file
└── package.json      # Dependencies and scripts
```

## Deployment

1. **Environment Variables**: Ensure all production environment variables are set
2. **Database**: Use MongoDB Atlas for production
3. **Process Manager**: Use PM2 for production process management
4. **Reverse Proxy**: Use Nginx as reverse proxy
5. **SSL**: Enable HTTPS with Let's Encrypt or similar

## Contributing

1. Follow existing code style and patterns
2. Add validation for new endpoints
3. Include error handling
4. Update this README for new features