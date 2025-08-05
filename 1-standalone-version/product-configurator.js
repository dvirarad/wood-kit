class ProductConfigurator {
    constructor(productId, config) {
        this.productId = productId;
        this.config = config;
        this.currentPrice = config.basePrice;
        this.currentConfig = this.getDefaultConfiguration();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updatePrice();
        this.loadConfiguration();
    }

    getDefaultConfiguration() {
        const defaultConfig = { lacquer: false };
        
        for (const [dimension, settings] of Object.entries(this.config.dimensions)) {
            defaultConfig[dimension] = settings.default;
        }
        
        return defaultConfig;
    }

    getDimensionsOnly() {
        const dimensions = {};
        for (const [key, value] of Object.entries(this.currentConfig)) {
            if (this.config.dimensions[key]) {
                dimensions[key] = value;
            }
        }
        return dimensions;
    }

    getOptionsOnly() {
        const options = {};
        for (const [key, value] of Object.entries(this.currentConfig)) {
            if (!this.config.dimensions[key]) {
                options[key] = value;
            }
        }
        return options;
    }

    setupEventListeners() {
        // Dimension inputs (sliders)
        for (const dimension of Object.keys(this.config.dimensions)) {
            const input = document.getElementById(dimension);
            const valueDisplay = document.getElementById(`${dimension}Value`);
            
            if (input) {
                input.addEventListener('input', () => {
                    const value = input.value;
                    this.onDimensionChange(dimension, value);
                    // Update value display
                    if (valueDisplay) {
                        valueDisplay.textContent = value;
                    }
                });
                input.addEventListener('change', () => this.validateDimension(dimension, input));
            }
        }

        // Lacquer checkbox
        const lacquerCheckbox = document.getElementById('lacquer');
        if (lacquerCheckbox) {
            lacquerCheckbox.addEventListener('change', () => this.onLacquerChange(lacquerCheckbox.checked));
        }

        // Handrail checkbox (for stairs)
        const handrailCheckbox = document.getElementById('handrail');
        if (handrailCheckbox) {
            handrailCheckbox.addEventListener('change', () => this.onHandrailChange(handrailCheckbox.checked));
        }

        // Action buttons
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addToCart());
        }

        const saveConfigBtn = document.getElementById('saveConfigBtn');
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => this.saveConfiguration());
        }

        // Admin button
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => this.showAdminPanel());
        }
    }

    onDimensionChange(dimension, value) {
        const numValue = parseFloat(value) || 0;
        this.currentConfig[dimension] = numValue;
        this.updatePrice();
    }

    onLacquerChange(checked) {
        this.currentConfig.lacquer = checked;
        this.updatePrice();
    }

    onHandrailChange(checked) {
        this.currentConfig.handrail = checked;
        this.updatePrice();
    }

    validateDimension(dimension, input) {
        const settings = this.config.dimensions[dimension];
        const value = parseFloat(input.value) || 0;
        
        if (value < settings.min) {
            input.value = settings.min;
            this.currentConfig[dimension] = settings.min;
        } else if (value > settings.max) {
            input.value = settings.max;
            this.currentConfig[dimension] = settings.max;
        }
        
        this.updatePrice();
    }

    calculatePrice() {
        let totalPrice = this.config.basePrice;
        let sizeAdjustment = 0;

        // Calculate size-based pricing
        for (const [dimension, value] of Object.entries(this.currentConfig)) {
            if (dimension === 'lacquer') continue;
            
            const settings = this.config.dimensions[dimension];
            if (settings) {
                const difference = value - settings.default;
                sizeAdjustment += difference * settings.multiplier;
            }
        }

        totalPrice += sizeAdjustment;

        // Add lacquer cost
        const lacquerCost = this.currentConfig.lacquer ? this.config.lacquerPrice : 0;
        totalPrice += lacquerCost;

        // Add handrail cost (for stairs)
        const handrailCost = this.currentConfig.handrail ? (this.config.handrailPrice || 0) : 0;
        totalPrice += handrailCost;

        return {
            basePrice: this.config.basePrice,
            sizeAdjustment: sizeAdjustment,
            lacquerCost: lacquerCost,
            handrailCost: handrailCost,
            totalPrice: Math.max(totalPrice, 0) // Ensure non-negative price
        };
    }

    async updatePrice() {
        let pricing;
        
        // Try to use API for accurate pricing, fall back to local calculation
        if (window.apiService) {
            try {
                const response = await window.apiService.calculatePrice(this.productId, {
                    dimensions: this.getDimensionsOnly(),
                    options: this.getOptionsOnly()
                });
                
                if (response.success) {
                    pricing = response.data;
                } else {
                    pricing = this.calculatePrice(); // Fallback
                }
            } catch (error) {
                console.warn('API price calculation failed, using local calculation:', error);
                pricing = this.calculatePrice(); // Fallback
            }
        } else {
            pricing = this.calculatePrice();
        }
        
        // Update main price display
        const currentPriceEl = document.getElementById('currentPrice');
        if (currentPriceEl) {
            currentPriceEl.textContent = `₪${pricing.totalPrice.toFixed(2)}`;
        }

        // Update price breakdown
        document.getElementById('basePrice').textContent = `₪${pricing.basePrice.toFixed(2)}`;
        document.getElementById('sizeAdjustment').textContent = 
            pricing.sizeAdjustment >= 0 ? `+₪${pricing.sizeAdjustment.toFixed(2)}` : `-₪${Math.abs(pricing.sizeAdjustment).toFixed(2)}`;
        document.getElementById('lacquerPrice').textContent = `₪${pricing.lacquerCost.toFixed(2)}`;
        
        // Update handrail price if element exists (for stairs)
        const handrailPriceEl = document.getElementById('handrailPrice');
        if (handrailPriceEl) {
            handrailPriceEl.textContent = `₪${pricing.handrailCost.toFixed(2)}`;
        }
        
        document.getElementById('totalPrice').textContent = `₪${pricing.totalPrice.toFixed(2)}`;

        this.currentPrice = pricing.totalPrice;
    }

    addToCart() {
        const cartItem = {
            id: `${this.productId}-${Date.now()}`,
            productId: this.productId,
            name: this.getProductName(),
            configuration: { ...this.currentConfig },
            price: this.currentPrice,
            quantity: 1,
            timestamp: new Date().toISOString()
        };

        // Get existing cart
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update cart icon
        this.updateCartIcon();

        // Show confirmation
        this.showAddedToCartMessage();
    }

    getProductName() {
        const productNames = {
            'venice-bookshelf': 'Venice Bookshelf',
            'amsterdam-bookshelf': 'Amsterdam Bookshelf',
            'stairs': 'Custom Stairs',
            'garden-bench': 'Garden Bench',
            'wooden-planter': 'Wooden Planter',
            'dog-bed': 'Dog Bed'
        };
        return productNames[this.productId] || 'Custom Product';
    }

    updateCartIcon() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon && cart.length > 0) {
            cartIcon.textContent = `🛒 ${cart.length}`;
        }
    }

    showAddedToCartMessage() {
        const btn = document.getElementById('addToCartBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Added to Cart!';
        btn.style.background = '#4CAF50';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#8B4513';
        }, 2000);
    }

    saveConfiguration() {
        const configKey = `config_${this.productId}`;
        localStorage.setItem(configKey, JSON.stringify(this.currentConfig));
        
        const btn = document.getElementById('saveConfigBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Configuration Saved!';
        
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }

    loadConfiguration() {
        const configKey = `config_${this.productId}`;
        const savedConfig = localStorage.getItem(configKey);
        
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                this.currentConfig = { ...this.currentConfig, ...config };
                
                // Update form fields
                for (const [key, value] of Object.entries(config)) {
                    const element = document.getElementById(key);
                    const valueDisplay = document.getElementById(`${key}Value`);
                    
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = value;
                        } else {
                            element.value = value;
                            // Update value display for sliders
                            if (valueDisplay) {
                                valueDisplay.textContent = value;
                            }
                        }
                    }
                }
                
                this.updatePrice();
            } catch (e) {
                console.error('Error loading saved configuration:', e);
            }
        }
    }

    showAdminPanel() {
        // Create admin overlay if it doesn't exist
        let overlay = document.getElementById('adminOverlay');
        if (!overlay) {
            overlay = this.createAdminPanel();
            document.body.appendChild(overlay);
        }
        
        overlay.style.display = 'flex';
    }

    createAdminPanel() {
        const overlay = document.createElement('div');
        overlay.id = 'adminOverlay';
        overlay.className = 'admin-overlay';
        
        overlay.innerHTML = `
            <div class="admin-panel">
                <h2>Admin Login</h2>
                <form class="admin-form" id="adminForm">
                    <div class="form-group">
                        <label for="adminUsername">Username:</label>
                        <input type="text" id="adminUsername" required>
                    </div>
                    <div class="form-group">
                        <label for="adminPassword">Password:</label>
                        <input type="password" id="adminPassword" required>
                    </div>
                    <div class="admin-buttons">
                        <button type="submit" class="login-btn">Login</button>
                        <button type="button" class="close-btn" onclick="this.closest('.admin-overlay').style.display='none'">Close</button>
                    </div>
                </form>
            </div>
        `;

        // Handle admin login
        const form = overlay.querySelector('#adminForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin();
        });

        return overlay;
    }

    handleAdminLogin() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        // Simple authentication (in production, use proper authentication)
        if (username === 'admin' && password === 'woodkits2024') {
            localStorage.setItem('adminLoggedIn', 'true');
            window.location.href = '../admin.html';
        } else {
            alert('Invalid credentials. Please try again.');
        }
    }
}

// Utility function to format configuration for display
function formatConfiguration(config) {
    let formatted = [];
    
    for (const [key, value] of Object.entries(config)) {
        if (key === 'lacquer') {
            if (value) formatted.push('Lacquer Finish: Yes');
        } else {
            formatted.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}cm`);
        }
    }
    
    return formatted.join(', ');
}

// Initialize cart icon on page load
document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon && cart.length > 0) {
        cartIcon.textContent = `🛒 ${cart.length}`;
    }
});