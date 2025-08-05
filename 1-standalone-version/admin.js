class AdminPanel {
    constructor() {
        this.init();
    }

    init() {
        // Check if user is logged in
        if (!localStorage.getItem('adminLoggedIn')) {
            window.location.href = 'index.html';
            return;
        }

        this.setupEventListeners();
        this.loadPricingData();
        this.loadOrders();
        this.loadSettings();
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'index.html';
        });
    }

    loadPricingData() {
        // Load saved pricing data or use defaults
        const pricingData = JSON.parse(localStorage.getItem('pricingData') || '{}');
        
        // Default pricing configurations
        const defaults = {
            'venice-bookshelf': {
                base: 149,
                length: 0.5,
                width: 1.2,
                height: 0.3,
                depth: 0.8,
                lacquer: 25
            },
            'amsterdam-bookshelf': {
                base: 129,
                length: 0.4,
                width: 1.0,
                height: 0.25,
                depth: 0.7,
                lacquer: 22
            },
            'stairs': {
                base: 299,
                length: 2.0,
                width: 1.5,
                steps: 15,
                handrail: 75,
                lacquer: 45
            },
            'garden-bench': {
                base: 179,
                length: 0.8,
                width: 1.0,
                height: 0.5,
                lacquer: 30
            },
            'wooden-planter': {
                base: 89,
                length: 0.6,
                height: 0.4,
                lacquer: 18
            },
            'dog-bed': {
                base: 119,
                length: 0.7,
                width: 0.9,
                height: 0.3,
                lacquer: 20
            }
        };

        // Populate form fields
        for (const [product, config] of Object.entries(defaults)) {
            const savedConfig = pricingData[product] || config;
            
            for (const [key, value] of Object.entries(savedConfig)) {
                const input = document.getElementById(`${product.replace('-bookshelf', '').replace('garden-', '').replace('wooden-', '').replace('dog-', 'dogbed-').replace('stairs', 'stairs')}-${key}`);
                if (input) {
                    input.value = value;
                }
            }
        }
    }

    loadOrders() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const container = document.getElementById('ordersContainer');
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="loading">No orders found.</p>';
            return;
        }

        // Sort orders by date (newest first)
        orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        container.innerHTML = '';
        orders.forEach(order => {
            const orderCard = this.createOrderCard(order);
            container.appendChild(orderCard);
        });
    }

    createOrderCard(order) {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-card';
        
        const orderDate = new Date(order.timestamp).toLocaleDateString();
        const orderTime = new Date(order.timestamp).toLocaleTimeString();
        
        orderElement.innerHTML = `
            <div class="order-info">
                <div class="order-id">${order.id}</div>
                <div class="order-date">${orderDate} at ${orderTime}</div>
                <div class="order-customer">
                    <strong>${order.customer.name}</strong><br>
                    ${order.customer.email}<br>
                    ${order.customer.phone}<br>
                    ${order.customer.address}
                </div>
            </div>
            <div class="order-details">
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <strong>${item.name}</strong> (Qty: ${item.quantity})<br>
                            <small>${this.formatItemConfiguration(item.configuration)}</small><br>
                            <span style="color: #8B4513;">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                ${order.customer.notes ? `<div><strong>Notes:</strong> ${order.customer.notes}</div>` : ''}
            </div>
            <div class="order-actions">
                <div class="order-total">$${order.total.toFixed(2)}</div>
                <div class="order-status status-${order.status}">${order.status}</div>
                <select onchange="adminPanel.updateOrderStatus('${order.id}', this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
        `;
        
        return orderElement;
    }

    formatItemConfiguration(config) {
        const formatted = [];
        
        for (const [key, value] of Object.entries(config)) {
            if (key === 'lacquer') {
                if (value) formatted.push('Lacquer Finish');
            } else if (key === 'handrail') {
                if (value) formatted.push('With Handrail');
            } else if (key === 'steps') {
                formatted.push(`${value} Steps`);
            } else {
                formatted.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}cm`);
            }
        }
        
        return formatted.join(', ');
    }

    updateOrderStatus(orderId, newStatus) {
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('orders', JSON.stringify(orders));
            this.showSuccessMessage('Order status updated successfully!');
            this.loadOrders(); // Refresh the orders display
        }
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        
        if (settings.taxRate) {
            document.getElementById('tax-rate').value = settings.taxRate;
        }
        if (settings.currencySymbol) {
            document.getElementById('currency-symbol').value = settings.currencySymbol;
        }
        if (settings.fromEmail) {
            document.getElementById('from-email').value = settings.fromEmail;
        }
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const dashboard = document.querySelector('.admin-dashboard');
        dashboard.insertBefore(successDiv, dashboard.firstChild);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}

// Global functions for onclick handlers
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function savePricing(productId) {
    const pricingData = JSON.parse(localStorage.getItem('pricingData') || '{}');
    
    // Map product IDs to form prefixes
    const prefixMap = {
        'venice-bookshelf': 'venice',
        'amsterdam-bookshelf': 'amsterdam',
        'stairs': 'stairs',
        'garden-bench': 'bench',
        'wooden-planter': 'planter',
        'dog-bed': 'dogbed'
    };
    
    const prefix = prefixMap[productId];
    
    if (!prefix) {
        console.error('Unknown product ID:', productId);
        return;
    }
    
    const config = {};
    
    // Get all input values for this product
    const inputs = document.querySelectorAll(`input[id^="${prefix}-"]`);
    inputs.forEach(input => {
        const key = input.id.replace(`${prefix}-`, '');
        config[key] = parseFloat(input.value) || 0;
    });
    
    // Save to localStorage
    pricingData[productId] = config;
    localStorage.setItem('pricingData', JSON.stringify(pricingData));
    
    // Visual feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Saved!';
    button.classList.add('saved');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('saved');
    }, 2000);
    
    adminPanel.showSuccessMessage(`Pricing for ${productId.replace('-', ' ')} updated successfully!`);
}

function saveGeneralSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    
    settings.taxRate = parseFloat(document.getElementById('tax-rate').value) || 10;
    settings.currencySymbol = document.getElementById('currency-symbol').value || '$';
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    adminPanel.showSuccessMessage('General settings saved successfully!');
}

function saveEmailSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    
    settings.emailApiKey = document.getElementById('email-api-key').value;
    settings.fromEmail = document.getElementById('from-email').value;
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    adminPanel.showSuccessMessage('Email settings saved successfully!');
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});