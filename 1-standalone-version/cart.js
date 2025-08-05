class CartManager {
    constructor() {
        this.cart = [];
        this.taxRate = 0.10; // 10% tax
        this.init();
    }

    init() {
        this.loadCart();
        this.renderCart();
        this.setupEventListeners();
        this.updateCartIcon();
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        this.cart = savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartIcon();
    }

    renderCart() {
        const cartContent = document.getElementById('cartContent');
        const cartSummary = document.getElementById('cartSummary');
        const emptyCart = document.getElementById('emptyCart');

        if (this.cart.length === 0) {
            emptyCart.style.display = 'block';
            cartSummary.style.display = 'none';
            cartContent.innerHTML = '';
            cartContent.appendChild(emptyCart);
            return;
        }

        emptyCart.style.display = 'none';
        cartSummary.style.display = 'block';

        const cartItems = document.createElement('div');
        cartItems.className = 'cart-items';

        this.cart.forEach((item, index) => {
            const cartItem = this.createCartItemElement(item, index);
            cartItems.appendChild(cartItem);
        });

        cartContent.innerHTML = '';
        cartContent.appendChild(cartItems);
        cartContent.appendChild(cartSummary);

        this.updateSummary();
    }

    createCartItemElement(item, index) {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        // Get translated text
        const removeText = window.translationManager ? 
            window.translationManager.getNestedTranslation('cart.remove') : 'Remove';
        
        itemElement.innerHTML = `
            <div class="item-image">
                ${this.getProductEmoji(item.productId)}
            </div>
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-config">${this.formatConfiguration(item.configuration)}</div>
            </div>
            <div class="item-price">₪${(item.price * item.quantity).toFixed(2)}</div>
            <div class="item-controls">
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="cartManager.updateQuantity(${index}, ${item.quantity - 1})">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" 
                           onchange="cartManager.updateQuantity(${index}, this.value)" min="1">
                    <button class="qty-btn" onclick="cartManager.updateQuantity(${index}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="cartManager.removeItem(${index})">${removeText}</button>
            </div>
        `;
        return itemElement;
    }

    getProductEmoji(productId) {
        const emojis = {
            'venice-bookshelf': '📚',
            'amsterdam-bookshelf': '📖',
            'stairs': '🪜',
            'garden-bench': '🪑',
            'wooden-planter': '🌱',
            'dog-bed': '🐕'
        };
        return emojis[productId] || '📦';
    }

    formatConfiguration(config) {
        const formatted = [];
        
        for (const [key, value] of Object.entries(config)) {
            if (key === 'lacquer') {
                if (value) formatted.push('Lacquer Finish: Yes');
            } else if (key === 'handrail') {
                formatted.push(`Handrail: ${value ? 'Yes' : 'No'}`);
            } else if (key === 'steps') {
                formatted.push(`Steps: ${value}`);
            } else {
                formatted.push(`${this.capitalizeFirst(key)}: ${value}cm`);
            }
        }
        
        return formatted.join(' • ');
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    updateQuantity(index, newQuantity) {
        const quantity = parseInt(newQuantity);
        if (quantity < 1) {
            this.removeItem(index);
            return;
        }

        this.cart[index].quantity = quantity;
        this.saveCart();
        this.renderCart();
    }

    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.renderCart();
    }

    updateSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * this.taxRate;
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `₪${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `₪${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `₪${total.toFixed(2)}`;
    }

    updateCartIcon() {
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            if (this.cart.length > 0) {
                cartIcon.textContent = `🛒 ${this.cart.length}`;
            } else {
                cartIcon.textContent = '🛒';
            }
        }
    }

    setupEventListeners() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.showCheckoutModal());
        }

        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        }

        // Admin button
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => this.showAdminPanel());
        }
    }

    showCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        modal.style.display = 'flex';
    }

    closeCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        modal.style.display = 'none';
    }

    async handleOrderSubmit(e) {
        e.preventDefault();
        
        const customerData = {
            name: document.getElementById('customerName').value,
            email: document.getElementById('customerEmail').value,
            phone: document.getElementById('customerPhone').value,
            address: document.getElementById('customerAddress').value
        };

        const orderData = {
            customer: customerData,
            items: this.cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity || 1,
                configuration: {
                    dimensions: item.dimensions || {},
                    options: item.options || {}
                }
            })),
            notes: document.getElementById('orderNotes').value,
            language: window.translationManager?.currentLanguage || 'en'
        };

        try {
            // Submit order to backend API
            const response = await window.apiService.createOrder(orderData);
            
            if (response.success) {
                // Clear cart
                this.cart = [];
                this.saveCart();
                
                // Show success message
                this.showOrderSuccess(response.data.orderId);
                
                // Close modal
                this.closeCheckoutModal();
            } else {
                throw new Error(response.message || 'Order submission failed');
            }
            
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('There was an error submitting your order. Please try again.');
        }
    }

    saveOrder(orderData) {
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    async sendConfirmationEmail(orderData) {
        // Placeholder for email service integration
        console.log('Sending confirmation email for order:', orderData.id);
        
        // This is where you would integrate with a third-party email service
        // For example: SendGrid, Mailgun, or similar
        // await emailService.send({
        //   to: orderData.customer.email,
        //   subject: `Order Confirmation - ${orderData.id}`,
        //   template: 'order-confirmation',
        //   data: orderData
        // });
        
        // For now, we'll simulate the email sending
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    showOrderSuccess(orderId) {
        const successDiv = document.createElement('div');
        successDiv.className = 'order-success';
        
        // Get translated text
        const orderSuccessText = window.translationManager ? 
            window.translationManager.getNestedTranslation('cart.order_success') : 'Order Submitted Successfully!';
        const orderIdText = window.translationManager ? 
            window.translationManager.getNestedTranslation('cart.order_id') : 'Your order ID is:';
        const confirmationEmailText = window.translationManager ? 
            window.translationManager.getNestedTranslation('cart.confirmation_email') : 'You will receive a confirmation email shortly.';
        
        successDiv.innerHTML = `
            <h3>${orderSuccessText}</h3>
            <p>${orderIdText} <strong>${orderId}</strong></p>
            <p>${confirmationEmailText}</p>
        `;
        
        const cartPage = document.querySelector('.cart-page');
        if (cartPage) {
            cartPage.insertBefore(successDiv, cartPage.firstChild);
        }
        
        // Re-render cart (should be empty now)
        this.renderCart();
        
        // Remove success message after 10 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 10000);
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
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        overlay.innerHTML = `
            <div class="admin-panel" style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
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
                    <div class="form-buttons">
                        <button type="submit" class="submit-order-btn">Login</button>
                        <button type="button" class="cancel-btn" onclick="this.closest('.admin-overlay').style.display='none'">Close</button>
                    </div>
                </form>
            </div>
        `;

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
        
        if (username === 'admin' && password === 'woodkits2024') {
            localStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'admin.html';
        } else {
            alert('Invalid credentials. Please try again.');
        }
    }
}

// Global function to close checkout modal (called from HTML)
function closeCheckoutModal() {
    cartManager.closeCheckoutModal();
}

// Initialize cart manager when DOM is loaded
let cartManager;
document.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();
});