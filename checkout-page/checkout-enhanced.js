/* ========================================
 * ENHANCED CHECKOUT PAGE LOGIC
 * Features:
 * - Dynamically loads cart items from localStorage
 * - Reads applied coupon and calculates discount
 * - Renders order summary table
 * - Handles empty cart state
 * - Form validation and order placement
 * ======================================== */

(function () {
  'use strict';

  /* ========================================
   * CONFIGURATION & CONSTANTS
   * ======================================== */

  const CART_STORAGE_KEY = 'restaurant_cart_items';
  const COUPON_STORAGE_KEY = 'restaurant_applied_coupon';
  const SHIPPING_COST = 6.00; // Flat rate shipping

  /* ========================================
   * CART STATE MANAGEMENT
   * ======================================== */

  /**
   * Get cart items from localStorage
   * @returns {Array} Cart items array
   */
  function getCartItems() {
    try {
      const items = localStorage.getItem(CART_STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  /**
   * Get applied coupon from localStorage
   * @returns {Object|null} Applied coupon object
   */
  function getAppliedCoupon() {
    try {
      const coupon = localStorage.getItem(COUPON_STORAGE_KEY);
      return coupon ? JSON.parse(coupon) : null;
    } catch (error) {
      console.error('Error loading coupon:', error);
      return null;
    }
  }

  /* ========================================
   * CART CALCULATIONS
   * ======================================== */

  /**
   * Calculate cart subtotal
   * @param {Array} items - Cart items
   * @returns {Number} Subtotal amount
   */
  function calculateSubtotal(items) {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  }

  /**
   * Calculate discount amount based on coupon
   * @param {Number} subtotal - Cart subtotal
   * @param {Object} coupon - Applied coupon object
   * @returns {Number} Discount amount
   */
  function calculateDiscount(subtotal, coupon) {
    if (!coupon) return 0;

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.discount / 100);
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.discount, subtotal);
    }
    // Note: 'freeship' type doesn't affect subtotal discount
    return discount;
  }

  /**
   * Calculate final total
   * @param {Number} subtotal - Cart subtotal
   * @param {Number} discount - Discount amount
   * @param {Number} shipping - Shipping cost
   * @returns {Number} Final total
   */
  function calculateTotal(subtotal, discount, shipping) {
    return Math.max(0, subtotal - discount + shipping);
  }

  /* ========================================
   * DOM MANIPULATION
   * ======================================== */

  /**
   * Format currency value
   * @param {Number} value - Numeric value
   * @returns {String} Formatted currency string
   */
  function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
  }

  /**
   * Render order items in the table
   * @param {Array} items - Cart items
   */
  function renderOrderItems(items) {
    const tbody = document.querySelector('.order-table tbody');
    if (!tbody) return;

    // Clear existing items
    tbody.innerHTML = '';

    // Render each cart item
    items.forEach(item => {
      const tr = document.createElement('tr');
      const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
      
      tr.innerHTML = `
        <td>${item.title} × ${item.quantity}</td>
        <td>${formatCurrency(itemTotal)}</td>
      `;
      
      tbody.appendChild(tr);
    });
  }

  /**
   * Update order totals in the table
   * @param {Number} subtotal - Cart subtotal
   * @param {Number} discount - Discount amount
   * @param {Object} coupon - Applied coupon object
   * @param {Number} shipping - Shipping cost
   * @param {Number} total - Final total
   */
  function updateOrderTotals(subtotal, discount, coupon, shipping, total) {
    const tfoot = document.querySelector('.order-table tfoot');
    if (!tfoot) return;

    let shippingText = formatCurrency(shipping);
    
    // Check if coupon provides free shipping
    if (coupon && coupon.type === 'freeship') {
      shippingText = '<span style="text-decoration: line-through; color: #999;">Flat rate: ' + formatCurrency(shipping) + '</span> <span style="color: #4CAF50; font-weight: 600;">FREE</span>';
      shipping = 0; // Make shipping free
      total = subtotal - discount; // Recalculate total
    } else {
      shippingText = 'Flat rate: ' + formatCurrency(shipping);
    }

    let footerHTML = `
      <tr>
        <th>Subtotal</th>
        <td>${formatCurrency(subtotal)}</td>
      </tr>
    `;

    // Add discount row if there's a discount
    if (discount > 0) {
      footerHTML += `
        <tr class="discount-row">
          <th>Discount</th>
          <td style="color: #4CAF50; font-weight: 600;">-${formatCurrency(discount)}</td>
        </tr>
      `;
    }

    // Add coupon description if applied
    if (coupon && coupon.description) {
      footerHTML += `
        <tr class="coupon-row">
          <th>Coupon Applied</th>
          <td style="color: #4CAF50; font-size: 0.9em;">${coupon.code}: ${coupon.description}</td>
        </tr>
      `;
    }

    footerHTML += `
      <tr>
        <th>Shipping</th>
        <td>${shippingText}</td>
      </tr>
      <tr class="order-table__total">
        <th>Total</th>
        <td>${formatCurrency(total)}</td>
      </tr>
    `;

    tfoot.innerHTML = footerHTML;
  }

  /**
   * Show notification message
   * @param {String} message - Message to display
   * @param {String} type - Notification type ('success', 'error', 'info')
   */
  function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.checkout-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `checkout-notification checkout-notification--${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 24px;
      z-index: 99999;
      padding: 16px 20px;
      background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      animation: slideInRight 0.3s ease-out;
      max-width: 400px;
      cursor: pointer;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);

    // Click to dismiss
    notification.addEventListener('click', () => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    });
  }

  /**
   * Handle empty cart state
   */
  function handleEmptyCart() {
    // Show notification
    showNotification('Your cart is empty. Redirecting to cart page...', 'info');
    
    // Redirect to cart page after 2 seconds
    setTimeout(() => {
      window.location.href = '../cartpage/cart.html';
    }, 2000);
  }

  /* ========================================
   * FORM VALIDATION & ORDER PLACEMENT
   * ======================================== */

  /**
   * Validate form fields
   * @param {HTMLFormElement} form - Form element
   * @returns {Boolean} True if valid
   */
  function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#f44336';
        isValid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    // Email validation
    const emailField = form.querySelector('#email');
    if (emailField && emailField.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        emailField.style.borderColor = '#f44336';
        isValid = false;
        showNotification('Please enter a valid email address', 'error');
      }
    }

    // Phone validation
    const phoneField = form.querySelector('#phone');
    if (phoneField && phoneField.value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phoneField.value) || phoneField.value.length < 10) {
        phoneField.style.borderColor = '#f44336';
        isValid = false;
        showNotification('Please enter a valid phone number', 'error');
      }
    }

    // Payment method validation
    const paymentSelected = form.querySelector('input[name="payment"]:checked');
    if (!paymentSelected) {
      isValid = false;
      showNotification('Please select a payment method', 'error');
    }

    return isValid;
  }

  /**
   * Handle order placement
   * @param {Event} e - Form submit event
   */
  function handlePlaceOrder(e) {
    e.preventDefault();
    
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
      return;
    }

    // Get cart items and totals
    const items = getCartItems();
    if (items.length === 0) {
      handleEmptyCart();
      return;
    }

    const coupon = getAppliedCoupon();
    const subtotal = calculateSubtotal(items);
    const discount = calculateDiscount(subtotal, coupon);
    let shipping = SHIPPING_COST;
    
    // Check for free shipping
    if (coupon && coupon.type === 'freeship') {
      shipping = 0;
    }
    
    const total = calculateTotal(subtotal, discount, shipping);

    // Collect form data
    const formData = {
      firstName: form.querySelector('#firstName').value,
      lastName: form.querySelector('#lastName').value,
      country: form.querySelector('#country').value,
      street1: form.querySelector('#street1').value,
      street2: form.querySelector('#street2').value,
      city: form.querySelector('#city').value,
      district: form.querySelector('#district').value,
      zip: form.querySelector('#zip').value,
      phone: form.querySelector('#phone').value,
      email: form.querySelector('#email').value,
      paymentMethod: form.querySelector('input[name="payment"]:checked').value,
      items: items,
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      total: total,
      coupon: coupon ? coupon.code : null,
      orderDate: new Date().toISOString()
    };

    // Here you would normally send the order to a backend API
    // For now, we'll simulate success
    console.log('Order placed:', formData);

    // Show success message
    showNotification('Order placed successfully! Order ID: #' + Math.floor(Math.random() * 100000), 'success');

    // Clear cart after successful order
    setTimeout(() => {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
      
      // Redirect to a success page or homepage
      showNotification('Redirecting to homepage...', 'info');
      setTimeout(() => {
        window.location.href = '../homepage/index.html';
      }, 2000);
    }, 2000);
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  /**
   * Initialize checkout page
   */
  function initCheckout() {
    // Get cart items
    const items = getCartItems();
    
    // Check if cart is empty
    if (items.length === 0) {
      handleEmptyCart();
      return;
    }

    // Get applied coupon
    const coupon = getAppliedCoupon();

    // Calculate totals
    const subtotal = calculateSubtotal(items);
    const discount = calculateDiscount(subtotal, coupon);
    let shipping = SHIPPING_COST;
    
    // Check for free shipping
    if (coupon && coupon.type === 'freeship') {
      shipping = 0;
    }
    
    const total = calculateTotal(subtotal, discount, shipping);

    // Render order summary
    renderOrderItems(items);
    updateOrderTotals(subtotal, discount, coupon, shipping, total);

    // Setup form submission
    const form = document.querySelector('.form');
    if (form) {
      form.addEventListener('submit', handlePlaceOrder);
    }

    // Add input validation on blur
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      field.addEventListener('blur', () => {
        if (field.value.trim()) {
          field.style.borderColor = '';
        }
      });
    });

    console.log('Checkout initialized with', items.length, 'item(s)');
  }

  /* ========================================
   * AUTO-INITIALIZE ON DOM READY
   * ======================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
  } else {
    initCheckout();
  }

  /* ========================================
   * ADD ANIMATION STYLES
   * ======================================== */

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .discount-row th,
    .discount-row td {
      color: #4CAF50;
    }

    .coupon-row {
      font-size: 0.9em;
      background: #f0f9ff;
    }
  `;
  document.head.appendChild(style);

})();
