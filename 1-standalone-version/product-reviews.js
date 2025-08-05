class ProductReviewSystem {
    constructor(productId) {
        this.productId = productId;
        this.reviews = [];
        this.init();
    }

    init() {
        this.loadReviews();
        this.setupEventListeners();
        this.renderReviews();
        this.updateRatingDisplay();
    }

    loadReviews() {
        const savedReviews = localStorage.getItem(`reviews_${this.productId}`);
        this.reviews = savedReviews ? JSON.parse(savedReviews) : [];
    }

    saveReviews() {
        localStorage.setItem(`reviews_${this.productId}`, JSON.stringify(this.reviews));
    }

    setupEventListeners() {
        const submitBtn = document.getElementById('submitReview');
        const reviewForm = document.getElementById('reviewForm');
        const starRating = document.querySelectorAll('.star-rating .star');

        if (submitBtn && reviewForm) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitReview();
            });
        }

        // Star rating interaction
        starRating.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.setRating(index + 1);
            });
            
            star.addEventListener('mouseover', () => {
                this.highlightStars(index + 1);
            });
        });

        const ratingContainer = document.querySelector('.star-rating');
        if (ratingContainer) {
            ratingContainer.addEventListener('mouseleave', () => {
                this.resetStarHighlight();
            });
        }
    }

    setRating(rating) {
        this.selectedRating = rating;
        this.updateStarDisplay(rating);
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('hover');
            } else {
                star.classList.remove('hover');
            }
        });
    }

    resetStarHighlight() {
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach(star => star.classList.remove('hover'));
        if (this.selectedRating) {
            this.updateStarDisplay(this.selectedRating);
        }
    }

    updateStarDisplay(rating) {
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    submitReview() {
        const nameInput = document.getElementById('reviewerName');
        const textInput = document.getElementById('reviewText');
        
        if (!nameInput || !textInput) return;
        
        const name = nameInput.value.trim();
        const text = textInput.value.trim();
        const rating = this.selectedRating;

        if (!name || !text || !rating) {
            this.showMessage('Please fill in all fields and select a rating', 'error');
            return;
        }

        const review = {
            id: Date.now().toString(),
            name: name,
            text: text,
            rating: rating,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        this.reviews.unshift(review); // Add to beginning of array
        this.saveReviews();
        
        // Clear form
        nameInput.value = '';
        textInput.value = '';
        this.selectedRating = 0;
        this.updateStarDisplay(0);
        
        // Re-render reviews and update display
        this.renderReviews();
        this.updateRatingDisplay();
        
        this.showMessage('Review submitted successfully!', 'success');
    }

    renderReviews() {
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList) return;

        if (this.reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="no-reviews">
                    <p data-translate="reviews.no_reviews">No reviews yet. Be the first to review this product!</p>
                </div>
            `;
            return;
        }

        reviewsList.innerHTML = this.reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <span class="reviewer-name">${this.escapeHtml(review.name)}</span>
                        <span class="review-date">${review.date}</span>
                    </div>
                    <div class="review-rating">
                        ${this.generateStarDisplay(review.rating)}
                    </div>
                </div>
                <div class="review-text">
                    ${this.escapeHtml(review.text)}
                </div>
            </div>
        `).join('');

        // Apply translations to new content
        if (window.translationManager) {
            window.translationManager.translatePage();
        }
    }

    generateStarDisplay(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<span class="star filled">★</span>';
            } else {
                stars += '<span class="star">☆</span>';
            }
        }
        return stars;
    }

    updateRatingDisplay() {
        const avgRatingEl = document.getElementById('averageRating');
        const reviewCountEl = document.getElementById('reviewCount');
        const ratingStarsEl = document.getElementById('ratingStars');

        if (this.reviews.length === 0) {
            if (avgRatingEl) avgRatingEl.textContent = '0.0';
            if (reviewCountEl) reviewCountEl.textContent = '0';
            if (ratingStarsEl) ratingStarsEl.innerHTML = this.generateStarDisplay(0);
            return;
        }

        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / this.reviews.length).toFixed(1);

        if (avgRatingEl) avgRatingEl.textContent = averageRating;
        if (reviewCountEl) reviewCountEl.textContent = this.reviews.length;
        if (ratingStarsEl) ratingStarsEl.innerHTML = this.generateStarDisplay(Math.round(averageRating));
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('reviewMessage');
        if (!messageEl) return;

        messageEl.textContent = message;
        messageEl.className = `review-message ${type}`;
        messageEl.style.display = 'block';

        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public method to get review statistics
    getReviewStats() {
        if (this.reviews.length === 0) {
            return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
        }

        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        const average = totalRating / this.reviews.length;
        
        // Calculate star distribution
        const distribution = [0, 0, 0, 0, 0];
        this.reviews.forEach(review => {
            distribution[review.rating - 1]++;
        });

        return {
            average: average,
            count: this.reviews.length,
            distribution: distribution
        };
    }
}

// Utility function to initialize reviews on product pages
function initializeProductReviews(productId) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.productReviews = new ProductReviewSystem(productId);
        });
    } else {
        window.productReviews = new ProductReviewSystem(productId);
    }
}