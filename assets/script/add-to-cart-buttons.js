// ================================
// ADD TO CART BUTTON ENHANCEMENTS
// Standardized button states and animations
// ================================

(function () {
  'use strict';

  // ================================
  // BUTTON STATE MANAGER
  // ================================

  class AddToCartButton {
    constructor(button) {
      this.button = button;
      this.originalHTML = button.innerHTML;
      this.isProcessing = false;
    }

    /**
     * Show loading state
     */
    showLoading() {
      if (this.isProcessing) return;
      this.isProcessing = true;

      this.button.disabled = true;
      this.button.classList.add('btn--loading');

      // Store original dimensions to prevent layout shift
      const computedStyle = window.getComputedStyle(this.button);
      this.button.style.minWidth = computedStyle.width;
      this.button.style.minHeight = computedStyle.height;

      // For icon buttons (cart icon)
      if (this.button.classList.contains('menu__card-cart-btn')) {
        this.button.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn__spinner">
            <circle cx="12" cy="12" r="10" opacity="0.25"/>
            <path d="M12 2 A10 10 0 0 1 22 12" opacity="1"/>
          </svg>
        `;
      } else {
        // For text buttons - keep original text, just add spinner
        this.button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn__spinner" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
            <circle cx="12" cy="12" r="10" opacity="0.25"/>
            <path d="M12 2 A10 10 0 0 1 22 12" opacity="1"/>
          </svg>
          <span style="vertical-align: middle;">${this.originalHTML.replace(/<[^>]*>/g, '').trim()}</span>
        `;
      }
    }

    /**
     * Show success state with checkmark
     */
    showSuccess() {
      this.button.classList.remove('btn--loading');
      this.button.classList.add('btn--success');

      // For icon buttons
      if (this.button.classList.contains('menu__card-cart-btn')) {
        this.button.innerHTML = `
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 640 640" 
            class="btn__checkmark"
            width="24" 
            height="24" 
            fill="white"  <!-- optional: set fill color -->
          >
            <path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/>
          </svg>
                  `;
      } else {
        // For text buttons - show checkmark with "Added!"
          this.button.innerHTML = `
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 640 640"
              fill="currentColor"
              class="btn__checkmark"
              style="display: inline-block; vertical-align: middle;"
            >
              <!-- Font Awesome Check -->
              <path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/>
            </svg>
            <span style="vertical-align: middle;">Added!</span>
          `;
      }

      // Trigger pop animation
      this.button.style.animation = 'buttonPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }

    /**
     * Reset button to original state
     */
    reset() {
      this.button.disabled = false;
      this.button.classList.remove('btn--loading', 'btn--success');
      this.button.innerHTML = this.originalHTML;
      this.button.style.animation = '';
      this.button.style.minWidth = '';
      this.button.style.minHeight = '';
      this.isProcessing = false;
    }

    /**
     * Create ripple effect
     */
    createRipple(event) {
      const button = this.button;
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();

      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.className = 'btn__ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  }

  // ================================
  // ENHANCED ADD TO CART FUNCTION
  // ================================

  /**
   * Enhanced add to cart with animations
   * @param {Object} item - Item to add
   * @param {HTMLElement} button - Button element
   * @param {Boolean} navigate - Whether to navigate to cart (default: false)
   */
  window.enhancedAddToCart = function (item, button, navigate = false) {
    const btnManager = new AddToCartButton(button);

    // Show loading state
    btnManager.showLoading();

    // Get existing cart from localStorage
    let cart = [];
    try {
      const cartData = localStorage.getItem('restaurantCart');
      if (cartData) {
        cart = JSON.parse(cartData);
      }
    } catch (e) {
      console.error('Error reading cart:', e);
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === item.id);

    if (existingItemIndex > -1) {
      // Item exists, increase quantity
      cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
      // Add new item to cart
      const cartItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        desc: item.desc || '',
        quantity: 1,
      };
      cart.push(cartItem);
    }

    // Save to localStorage
    try {
      localStorage.setItem('restaurantCart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
      btnManager.reset();
      return;
    }

    // Show success state after a short delay
    setTimeout(() => {
      btnManager.showSuccess();

      // Show notification if available
      if (window.NotificationSystem) {
        const qty = cart[existingItemIndex > -1 ? existingItemIndex : cart.length - 1].quantity;
        window.NotificationSystem.success(
          `${item.title} ${existingItemIndex > -1 ? 'quantity updated' : 'added to cart'}! (${qty}x)`,
          {
            duration: 3000,
          }
        );
      }

      // Reset button after showing success
      setTimeout(() => {
        if (navigate) {
          // Navigate to cart page
          if (window.GlobalLoader) {
            window.GlobalLoader.show('Redirecting to cart...');
          }
          setTimeout(() => {
            window.location.href = '/cartpage/cart.html';
          }, 300);
        } else {
          // Reset button
          btnManager.reset();
        }
      }, 1200);
    }, 500);
  };

  // ================================
  // AUTO-SETUP FOR BUTTONS
  // ================================

  /**
   * Setup ripple effect for all add-to-cart buttons
   */
  function setupRippleEffects() {
    const buttons = document.querySelectorAll('.menu__card-cart-btn, .menu__card-btn, .btn');

    buttons.forEach((button) => {
      // Avoid duplicate listeners
      if (button.dataset.rippleSetup) return;
      button.dataset.rippleSetup = 'true';

      // Make button position relative for ripple positioning
      if (getComputedStyle(button).position === 'static') {
        button.style.position = 'relative';
      }

      button.style.overflow = 'hidden';

      button.addEventListener('click', (e) => {
        const btnManager = new AddToCartButton(button);
        btnManager.createRipple(e);
      });
    });
  }

  // ================================
  // INITIALIZATION
  // ================================

  // Setup on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupRippleEffects);
  } else {
    setupRippleEffects();
  }

  // Re-setup when new content is dynamically loaded
  const observer = new MutationObserver(() => {
    setupRippleEffects();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Export for external use
  window.AddToCartButton = AddToCartButton;
})();
