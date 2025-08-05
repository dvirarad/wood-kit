# Wood Kits E-Commerce Platform

A complete e-commerce solution for custom wood furniture with multi-language support (English, Hebrew, Spanish) and custom product configuration.

## 📁 Project Structure

This repository contains **two separate implementations** of the same Wood Kits e-commerce platform:

```
kits-wood/
├── 📁 1-standalone-version/     # Simple HTML/CSS/JS version
│   ├── index.html              # Homepage
│   ├── about.html              # About page  
│   ├── cart.html               # Shopping cart
│   ├── styles.css              # Main stylesheet
│   ├── script.js               # Main JavaScript
│   ├── 📁 products/            # Product pages
│   ├── 📁 translations/        # Language files
│   └── README.md               # Standalone setup guide
├── 📁 2-react-migrated-version/ # Modern React + Node.js version
│   ├── 📁 frontend/            # React TypeScript frontend
│   ├── 📁 backend/             # Node.js Express API
│   └── README.md               # React setup guide
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 🚀 Quick Start

### Option 1: Simple Standalone Version
Perfect for learning, prototyping, or simple websites.

```bash
cd 1-standalone-version
python -m http.server 8080
# Visit: http://localhost:8080
```

**Features:**
- Pure HTML/CSS/JavaScript
- No build process required
- localStorage-based cart
- Multi-language support
- Responsive design

### Option 2: React Migrated Version  
Production-ready full-stack application.

```bash
# Option A: Manual setup
# Backend
cd 2-react-migrated-version/backend
npm install && cp .env.example .env
npm run dev  # http://localhost:5000

# Frontend (new terminal)
cd 2-react-migrated-version/frontend  
npm install && npm start  # http://localhost:3000

# Option B: Using helper scripts (recommended)
cd 2-react-migrated-version
chmod +x *.sh
./start-backend.sh    # Terminal 1
./start-frontend.sh   # Terminal 2
```

**Features:**
- React 18 + TypeScript
- Node.js + Express API
- MongoDB database
- Material-UI design system
- Stripe payments
- SendGrid emails
- Admin panel

## 🏗️ Architecture Comparison

| Feature | Standalone Version | React Migrated Version |
|---------|-------------------|------------------------|
| **Frontend** | HTML + CSS + JS | React + TypeScript |
| **Backend** | None | Node.js + Express |
| **Database** | localStorage | MongoDB |
| **State Management** | Vanilla JS | React Context API |
| **UI Framework** | Custom CSS | Material-UI |
| **Build Process** | None | Webpack (CRA) |
| **Type Safety** | None | Full TypeScript |
| **API** | None | RESTful API |
| **Authentication** | None | Admin login |
| **Payments** | None | Stripe integration |
| **Email** | None | SendGrid integration |
| **Scalability** | Limited | Production ready |
| **Complexity** | Low | Medium-High |
| **Setup Time** | < 5 minutes | 15-20 minutes |

## 🎯 When to Use Which Version?

### Choose Standalone Version When:
- 🚀 **Quick prototyping** - Need something running in minutes
- 📚 **Learning web development** - Understanding HTML/CSS/JS basics
- 🏢 **Small business** - Simple product catalog without complex backend
- 💡 **Proof of concept** - Demonstrating UI/UX ideas
- 🔧 **No backend needed** - Client-side only requirements
- 📱 **Static hosting** - Deploy to GitHub Pages, Netlify, etc.

### Choose React Migrated Version When:
- 🏭 **Production application** - Real business with customers
- 📈 **Scalability needed** - Growing product catalog and orders
- 💳 **Payment processing** - Accept real payments via Stripe
- 📧 **Email notifications** - Automated order confirmations
- 👨‍💼 **Admin panel** - Manage orders, products, reviews
- 🔒 **Data persistence** - Store orders, customers, inventory
- 🚀 **Modern development** - TypeScript, testing, CI/CD

## 🌟 Common Features (Both Versions)

- ✅ **Product Configuration** - Interactive sliders for custom dimensions
- ✅ **Multi-language Support** - English, Hebrew (RTL), Spanish
- ✅ **Responsive Design** - Mobile, tablet, desktop optimized
- ✅ **Shopping Cart** - Add/remove items, quantity adjustment
- ✅ **Real-time Pricing** - Price updates as you configure
- ✅ **Product Catalog** - Bookshelves, stairs, garden furniture, pet beds
- ✅ **Custom Options** - Lacquer finish, handrails, etc.
- ✅ **Order Form** - Customer information and notes

## 🛠️ Available Products

Both versions include these customizable products:

- 📚 **Amsterdam Bookshelf** - Modern design with adjustable height/width
- 📖 **Venice Bookshelf** - Classic style with custom dimensions  
- 🪜 **Custom Stairs** - Indoor stairs with optional handrail
- 🪑 **Garden Bench** - Outdoor seating with weather-resistant options
- 🌱 **Wooden Planter** - Garden planters in various sizes
- 🐕 **Dog Bed** - Comfortable pet furniture in custom sizes

## 🌐 Multi-Language Support

- **English (EN)** - Default language, left-to-right
- **Hebrew (HE)** - Full RTL (right-to-left) layout support  
- **Spanish (ES)** - Complete Spanish translations

Language switching is instant and affects:
- All UI text and navigation
- Product names and descriptions
- Price formatting and currency
- Layout direction (RTL for Hebrew)

## 🚀 Migration Path

Start with the **Standalone Version** for:
1. Quick proof of concept
2. Learning the business logic
3. Testing with users
4. Finalizing design and features

Then migrate to **React Version** when you need:
1. Real customer orders
2. Payment processing
3. Inventory management
4. Email notifications
5. Admin capabilities
6. Production scalability

## 🔧 Troubleshooting

### Common Issues

**React Frontend Won't Start**
```bash
# Error: Cannot find module '../scripts/start'
cd 2-react-migrated-version/frontend
rm -rf node_modules package-lock.json
npm install
# OR use: npx react-scripts start
```

**Backend Database Connection Error**
```bash
# Make sure MongoDB is running
mongod
# OR update MONGODB_URI in .env file for MongoDB Atlas
```

**Port Already in Use**
```bash
# Kill processes on ports 3000 or 5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

## 📖 Documentation

- **1-standalone-version/README.md** - Complete standalone setup guide
- **2-react-migrated-version/README.md** - Full-stack setup guide
- **PROJECT_SETUP.md** - Quick setup guide and project overview
- **Helper Scripts** - `start-frontend.sh` and `start-backend.sh` for easy startup

## 🤝 Contributing

1. Choose the version you want to work on
2. Follow the setup instructions in the respective README
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Feel free to use this code for your own projects!

---

**Perfect for wood furniture businesses, carpentry shops, custom furniture makers, or anyone selling configurable products online.**