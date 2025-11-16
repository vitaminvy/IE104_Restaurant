// ================================
// COUPON SUGGESTER
// Smart coupon recommendations based on cart value
// ================================

/**
 * CouponSuggester - Suggest applicable coupons to increase cart value
 * Features: Monitor cart, suggest coupons, calculate savings
 */
class CouponSuggester {
  constructor() {
    this.coupons = this.loadAvailableCoupons();
    this.lastSuggestedCoupon = null;
    this.attachEventHandlers();
  }

  /**
   * Load available coupons (from global or define here)
   * @returns {Array} Coupons array
   */
  loadAvailableCoupons() {
    // Define available coupons with conditions
    return [
      {
        code: 'SAVE10',
        type: 'percentage',
        discount: 10,
        minPurchase: 20,
        description: '10% off orders over $20',
      },
      {
        code: 'SAVE20',
        type: 'percentage',
        discount: 20,
        minPurchase: 50,
        description: '20% off orders over $50',
      },
      {
        code: 'FLAT5',
        type: 'fixed',
        discount: 5,
        minPurchase: 30,
        description: '$5 off orders over $30',
      },
      {
        code: 'WELCOME15',
        type: 'percentage',
        discount: 15,
        minPurchase: 0,
        description: '15% off your first order',
        firstOrderOnly: true,
      },
      {
        code: 'FREESHIP',
        type: 'freeship',
        discount: 0,
        minPurchase: 40,
        description: 'Free shipping on orders over $40',
      },
      {
        code: 'BIGORDER',
        type: 'percentage',
        discount: 25,
        minPurchase: 100,
        description: '25% off orders over $100',
      },
    ];
  }

  /**
   * Attach event handlers
   */
  attachEventHandlers() {
    // Listen for cart updates
    EventBus.on(EVENT_NAMES.CART_UPDATED, (data) => {
      this.checkCartForSuggestions(data.cart);
    });

    // Check cart on page load
    if (
      window.location.pathname.includes('cart') ||
      window.location.pathname.includes('checkout')
    ) {
      const cart = StorageManager.get(STORAGE_KEYS.CART, []);
      if (cart.length > 0) {
        setTimeout(() => {
          this.checkCartForSuggestions(cart);
        }, 2000); // Delay to not interrupt page load
      }
    }
  }

  /**
   * Check cart and suggest coupons
   * @param {Array} cart - Cart items
   */
  checkCartForSuggestions(cart) {
    const subtotal = this.calculateSubtotal(cart);
    const appliedCoupon = StorageManager.get(STORAGE_KEYS.COUPON, null);

    // Don't suggest if coupon already applied
    if (appliedCoupon) return;

    // Find best suggestion
    const suggestion = this.findBestSuggestion(subtotal);

    if (suggestion) {
      this.showSuggestion(suggestion, subtotal);
    }
  }

  /**
   * Calculate cart subtotal
   * @param {Array} cart - Cart items
   * @returns {number} Subtotal
   */
  calculateSubtotal(cart) {
    return cart.reduce((total, item) => {
      return total + item.price * (item.quantity || 1);
    }, 0);
  }

  /**
   * Find best coupon suggestion
   * @param {number} subtotal - Current cart subtotal
   * @returns {Object|null} Suggestion object
   */
  findBestSuggestion(subtotal) {
    // Find coupons user can apply now
    const applicableCoupons = this.coupons.filter((c) => {
      if (c.firstOrderOnly && this.hasOrderHistory()) {
        return false;
      }
      return subtotal >= c.minPurchase;
    });

    // Find coupons user is close to unlocking
    const almostUnlockedCoupons = this.coupons.filter((c) => {
      if (c.firstOrderOnly && this.hasOrderHistory()) {
        return false;
      }
      const difference = c.minPurchase - subtotal;
      return difference > 0 && difference <= 10; // Within $10
    });

    // Prioritize "almost unlocked" coupons (encourage spending)
    if (almostUnlockedCoupons.length > 0) {
      // Sort by best discount
      almostUnlockedCoupons.sort((a, b) => {
        const aValue = this.calculateSavings(a, a.minPurchase);
        const bValue = this.calculateSavings(b, b.minPurchase);
        return bValue - aValue;
      });

      const coupon = almostUnlockedCoupons[0];
      return {
        type: 'almost',
        coupon,
        amountNeeded: coupon.minPurchase - subtotal,
        potentialSavings: this.calculateSavings(coupon, coupon.minPurchase),
      };
    }

    // Otherwise, suggest best applicable coupon
    if (applicableCoupons.length > 0) {
      // Sort by best discount
      applicableCoupons.sort((a, b) => {
        const aValue = this.calculateSavings(a, subtotal);
        const bValue = this.calculateSavings(b, subtotal);
        return bValue - aValue;
      });

      const coupon = applicableCoupons[0];

      // Don't re-suggest same coupon
      if (this.lastSuggestedCoupon === coupon.code) {
        return null;
      }

      return {
        type: 'applicable',
        coupon,
        savings: this.calculateSavings(coupon, subtotal),
      };
    }

    return null;
  }

  /**
   * Calculate potential savings from coupon
   * @param {Object} coupon - Coupon object
   * @param {number} subtotal - Order subtotal
   * @returns {number} Savings amount
   */
  calculateSavings(coupon, subtotal) {
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.discount) / 100;
    } else if (coupon.type === 'fixed') {
      return Math.min(coupon.discount, subtotal);
    } else if (coupon.type === 'freeship') {
      return DEFAULTS.SHIPPING_COST;
    }
    return 0;
  }

  /**
   * Show coupon suggestion notification
   * @param {Object} suggestion - Suggestion object
   * @param {number} subtotal - Current subtotal
   */
  showSuggestion(suggestion, subtotal) {
    const { type, coupon } = suggestion;

    let message = '';
    let actionButton = '';

    if (type === 'almost') {
      message = `Add $${suggestion.amountNeeded.toFixed(2)} more to unlock <strong>${coupon.code}</strong> and save $${suggestion.potentialSavings.toFixed(2)}!`;
      actionButton = `
        <button class="notification-action-btn" onclick="window.location.href='/menupage/index.html'">
          Browse Menu
        </button>
      `;
    } else if (type === 'applicable') {
      message = `Apply code <strong>${coupon.code}</strong> to save $${suggestion.savings.toFixed(2)}!`;
      actionButton = `
        <button class="notification-action-btn" id="apply-suggested-coupon-${coupon.code}">
          Apply Now
        </button>
      `;
    }

    // Show custom notification with action button
    this.showCustomNotification(message, actionButton, coupon);

    // Track suggestion
    this.lastSuggestedCoupon = coupon.code;
  }

  /**
   * Show custom notification with action button
   * @param {string} message - Notification message
   * @param {string} actionButton - HTML for action button
   * @param {Object} coupon - Coupon object
   */
  showCustomNotification(message, actionButton, coupon) {
    // Create custom notification
    const notificationHTML = `
      <div class="coupon-suggestion-notification" id="coupon-suggestion-notification">
        <div class="coupon-suggestion-content">
          <div class="coupon-suggestion-icon">💰</div>
          <div class="coupon-suggestion-text">
            <p>${message}</p>
            ${actionButton}
          </div>
          <button class="coupon-suggestion-close" id="close-coupon-suggestion">✕</button>
        </div>
      </div>
    `;

    // Remove existing notification
    const existing = document.getElementById('coupon-suggestion-notification');
    if (existing) {
      existing.remove();
    }

    // Insert notification
    document.body.insertAdjacentHTML('beforeend', notificationHTML);

    const notification = document.getElementById('coupon-suggestion-notification');

    // Close button
    document
      .getElementById('close-coupon-suggestion')
      .addEventListener('click', () => {
        notification.classList.add('coupon-suggestion-notification--hide');
        setTimeout(() => notification.remove(), 300);
      });

    // Apply coupon button
    const applyBtn = document.getElementById(
      `apply-suggested-coupon-${coupon.code}`
    );
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.applyCoupon(coupon.code);
        notification.remove();
      });
    }

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification && notification.parentElement) {
        notification.classList.add('coupon-suggestion-notification--hide');
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);

    // Animate in
    setTimeout(() => {
      notification.classList.add('coupon-suggestion-notification--visible');
    }, 100);
  }

  /**
   * Apply coupon code
   * @param {string} couponCode - Coupon code
   */
  applyCoupon(couponCode) {
    const coupon = this.coupons.find((c) => c.code === couponCode);
    if (!coupon) return;

    // Store coupon
    StorageManager.set(STORAGE_KEYS.COUPON, coupon);

    // Show success notification
    if (window.NotificationSystem) {
      window.NotificationSystem.success(`Coupon ${couponCode} applied!`, {
        duration: TIMINGS.NOTIFICATION_MEDIUM,
      });
    }

    // Emit event to update cart page
    EventBus.emit('coupon:applied', { coupon });

    // Reload cart page if on it
    if (
      window.location.pathname.includes('cart') ||
      window.location.pathname.includes('checkout')
    ) {
      window.location.reload();
    }
  }

  /**
   * Check if user has order history
   * @returns {boolean} Has history
   */
  hasOrderHistory() {
    if (window.OrderHistoryManager) {
      return window.OrderHistoryManager.getOrders().length > 0;
    }
    return false;
  }

  /**
   * Get all available coupons
   * @returns {Array} Coupons
   */
  getAllCoupons() {
    return [...this.coupons];
  }

  /**
   * Validate coupon code
   * @param {string} code - Coupon code
   * @param {number} subtotal - Cart subtotal
   * @returns {Object} Validation result
   */
  validateCoupon(code, subtotal) {
    const coupon = this.coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    if (coupon.minPurchase > subtotal) {
      return {
        valid: false,
        message: `Minimum purchase of $${coupon.minPurchase} required`,
      };
    }

    if (coupon.firstOrderOnly && this.hasOrderHistory()) {
      return {
        valid: false,
        message: 'This coupon is for first-time orders only',
      };
    }

    return {
      valid: true,
      coupon,
      savings: this.calculateSavings(coupon, subtotal),
    };
  }
}

// Initialize
window.CouponSuggester = new CouponSuggester();

console.log('✅ Coupon Suggester initialized');
