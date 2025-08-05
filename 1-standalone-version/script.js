document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartIcon = document.querySelector('.cart-icon');
    let cartCount = 0;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            cartCount++;
            updateCartIcon();
            
            const originalText = this.textContent;
            const addedText = window.translationManager ? 
                window.translationManager.getNestedTranslation('products.added') : 'Added!';
            this.textContent = addedText;
            this.style.background = '#4CAF50';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '#8B4513';
            }, 1500);
            
            animateAddToCart(this);
        });
    });

    function updateCartIcon() {
        if (cartCount > 0) {
            cartIcon.textContent = `🛒 ${cartCount}`;
        } else {
            cartIcon.textContent = '🛒';
        }
    }

    function animateAddToCart(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.nextElementSibling && this.nextElementSibling.classList.contains('dropdown-menu')) {
                e.preventDefault();
            }
        });
    });

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    productCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Admin button functionality
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            showAdminPanel();
        });
    }

    // Update cart icon on load
    updateCartIconFromStorage();
});

function updateCartIconFromStorage() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon && cart.length > 0) {
        cartIcon.textContent = `🛒 ${cart.length}`;
    }
}

function showAdminPanel() {
    // Create admin overlay if it doesn't exist
    let overlay = document.getElementById('adminOverlay');
    if (!overlay) {
        overlay = createAdminPanel();
        document.body.appendChild(overlay);
    }
    
    overlay.style.display = 'flex';
}

function createAdminPanel() {
    const overlay = document.createElement('div');
    overlay.id = 'adminOverlay';
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
        <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h2 style="color: #333; margin-bottom: 1.5rem; text-align: center;">Admin Login</h2>
            <form id="adminForm">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Username:</label>
                    <input type="text" id="adminUsername" required style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Password:</label>
                    <input type="password" id="adminPassword" required style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" style="flex: 1; background: #8B4513; color: white; border: none; padding: 0.75rem; border-radius: 6px; font-weight: 600; cursor: pointer;">Login</button>
                    <button type="button" onclick="closeAdminPanel()" style="flex: 1; background: #ccc; color: #333; border: none; padding: 0.75rem; border-radius: 6px; font-weight: 600; cursor: pointer;">Close</button>
                </div>
            </form>
        </div>
    `;

    const form = overlay.querySelector('#adminForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAdminLogin();
    });

    return overlay;
}

function handleAdminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === 'admin' && password === 'woodkits2024') {
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'admin.html';
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

function closeAdminPanel() {
    const overlay = document.getElementById('adminOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}