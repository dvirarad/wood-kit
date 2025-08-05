# Wood Kits - Standalone Version

A simple e-commerce website for custom wood furniture built with HTML, CSS, and vanilla JavaScript.

## 🏗️ Architecture

**Simple Static Website**

- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Data Storage**: localStorage for cart and orders
- **Multi-language**: Client-side translation system
- **Product Configuration**: JavaScript-based price calculation

## 🚀 Quick Start

### Prerequisites

- Web browser (Chrome, Firefox, Safari, etc.)
- Local web server (Python, Node.js, or Live Server)

### Running the Website

**Option 1: Python HTTP Server**
```bash
cd 1-standalone-version
python -m http.server 8080
```

**Option 2: Node.js HTTP Server**
```bash
cd 1-standalone-version
npx http-server -p 8080
```

**Option 3: VS Code Live Server**
1. Open folder in VS Code
2. Install "Live Server" extension
3. Right-click on `index.html` → "Open with Live Server"

✅ Visit: `http://localhost:8080`

## 🎯 Features

### Core Functionality
- ✅ Product browsing and configuration
- ✅ Real-time price calculation
- ✅ Shopping cart with localStorage
- ✅ Multi-language support (EN/HE/ES)
- ✅ Responsive design
- ✅ Order form submission (localStorage only)

### Products Available
- 📚 **Amsterdam Bookshelf** - Modern design
- 📖 **Venice Bookshelf** - Classic style  
- 🪜 **Custom Stairs** - With handrail option
- 🪑 **Garden Bench** - Outdoor furniture
- 🌱 **Wooden Planter** - Garden accessories
- 🐕 **Dog Bed** - Pet furniture

### Languages Supported
- **English** (en) - Default
- **Hebrew** (he) - RTL support
- **Spanish** (es)

## 📁 File Structure

```
1-standalone-version/
├── index.html              # Homepage
├── about.html              # About page
├── cart.html               # Shopping cart page
├── admin.html              # Admin panel
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript
├── cart.js                 # Cart functionality
├── product-configurator.js # Product customization
├── translations-inline.js  # Translation system
├── api-service.js          # API client (for future backend)
├── 📁 products/            # Individual product pages  
│   ├── stairs.html
│   ├── amsterdam-bookshelf.html
│   ├── venice-bookshelf.html
│   ├── garden-bench.html
│   ├── wooden-planter.html
│   └── dog-bed.html
├── 📁 translations/        # Language JSON files
│   ├── en.json
│   ├── he.json  
│   └── es.json
└── README.md              # This file
```

## 🔧 How It Works

### Product Configuration
1. Users select a product from the homepage
2. Configure dimensions using sliders
3. Add optional features (lacquer, handrail)
4. See real-time price updates
5. Add configured product to cart

### Shopping Cart
- Items stored in browser localStorage
- Persistent across browser sessions
- Quantity adjustment
- Remove items
- Order summary with tax calculation

### Multi-language
- Language selector in header
- Instant language switching
- RTL layout for Hebrew
- All content translated

### Order Submission
- Customer information form
- Order summary
- Currently saves to localStorage
- Ready for backend integration

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🔄 Future Migration

This standalone version is designed to be easily migrated to:
- React frontend
- Node.js backend with MongoDB
- Payment processing (Stripe)
- Email notifications (SendGrid)

See the `2-react-migrated-version` folder for the full-stack implementation.

## 📝 Development Notes

### Adding New Products
1. Create new HTML file in `products/` folder
2. Add product data to `product-configurator.js`
3. Update translations in `translations/` files
4. Add product card to `index.html`

### Customizing Styles
- Main styles in `styles.css`
- Product-specific styles in individual CSS files
- Responsive breakpoints: 768px (mobile), 1024px (tablet)

### Adding Languages
1. Create new JSON file in `translations/` folder
2. Update language selector in header
3. Add language option to `translations-inline.js`

## 🎨 Design System

- **Primary Color**: #8B4513 (Saddle Brown)
- **Secondary Color**: #D2691E (Chocolate)
- **Font**: System fonts (Arial, Helvetica, sans-serif)
- **Currency**: Israeli New Shekel (₪)

---

**Perfect for:** Simple websites, prototyping, learning web development, small businesses without complex backend needs.