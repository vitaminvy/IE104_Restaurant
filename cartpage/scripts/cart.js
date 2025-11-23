import i18nService from '../../assets/script/i18n-service.js';
(function () {
  'use strict';

  /* ========================================
   * CONFIGURATION & CONSTANTS
   * ======================================== */

  // Use same key as navigate-menu.js for consistency
  const CART_STORAGE_KEY = 'restaurantCart';
  const COUPON_STORAGE_KEY = 'restaurant_applied_coupon';

  // Available coupons
  const COUPONS = {
    'SAVE10': { discount: 10, type: 'percentage', description: '10% off' },
    'SAVE20': { discount: 20, type: 'percentage', description: '20% off' },
    'FLAT5': { discount: 5, type: 'fixed', description: '$5 off' },
    'WELCOME15': { discount: 15, type: 'percentage', description: '15% off for new customers' },
    'FREESHIP': { discount: 0, type: 'freeship', description: 'Free shipping' }
  };

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
      // console.error('Error loading cart:', error);
      return [];
    }
  }

  /**
   * Save cart items to localStorage
   * @param {Array} items - Cart items to save
   */
  function saveCartItems(items) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // console.error('Error saving cart:', error);
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
      // console.error('Error loading coupon:', error);
      return null;
    }
  }

  /**
   * Save applied coupon to localStorage
   * @param {Object} coupon - Coupon object to save
   */
  function saveAppliedCoupon(coupon) {
    try {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } catch (error) {
      // console.error('Error saving coupon:', error);
    }
  }

  /**
   * Clear applied coupon from localStorage
   */
  function clearAppliedCoupon() {
    localStorage.removeItem(COUPON_STORAGE_KEY);
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
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Calculate discount amount
   * @param {Number} subtotal - Cart subtotal
   * @param {Object} coupon - Applied coupon
   * @returns {Number} Discount amount
   */
  function calculateDiscount(subtotal, coupon) {
    if (!coupon) return 0;

    if (coupon.type === 'percentage') {
      return (subtotal * coupon.discount) / 100;
    } else if (coupon.type === 'fixed') {
      return Math.min(coupon.discount, subtotal); // Don't exceed subtotal
    }

    return 0;
  }

  /**
   * Calculate final total
   * @param {Number} subtotal - Cart subtotal
   * @param {Number} discount - Discount amount
   * @returns {Number} Final total
   */
  function calculateTotal(subtotal, discount) {
    return Math.max(0, subtotal - discount);
  }

  /* ========================================
   * DOM MANIPULATION
   * ======================================== */

  /**
   * Render cart items in table
   * @param {Array} items - Cart items to render
   */
  function renderCartItems(items) {
    const tbody = document.querySelector('.cart__table tbody');

    if (!tbody) return;

    // Clear existing rows
    tbody.innerHTML = '';

    // Check if cart is empty
    if (items.length === 0) {
      tbody.innerHTML = `
    <tr>
      <td colspan="6" 
          style="
            text-align: center;
            padding: 40px 20px;
            color: rgba(255,255,255,0.6);
            font-family: var(--font-body);
          ">
        <div style="
              display: flex;
              flex-direction: column; 
              justify-content: center;
              align-items: center;
          ">
          <i class="fa-solid fa-cart-shopping" 
             style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
          <p style="font-size: 18px; margin-bottom: 8px;">${i18nService.t('cart_page.empty_cart.message')}</p>
          <p style="font-size: 14px; opacity: 0.8;">${i18nService.t('cart_page.empty_cart.suggestion')}</p>
          <a href="../menupage/" class="cart__btn link-underline" style="margin-top: 24px;">
            ${i18nService.t('cart_page.empty_cart.cta')}
          </a>
        </div>
      </td>
    </tr>
  `;
      return;
    }


    // Render each item
    items.forEach((item, index) => {
      const row = createCartRow(item, index);
      tbody.appendChild(row);
    });
  }

  /**
   * Create a table row for cart item
   * @param {Object} item - Cart item data
   * @param {Number} index - Item index
   * @returns {HTMLElement} Table row element
   */
  function createCartRow(item, index) {
    const tr = document.createElement('tr');
    tr.dataset.index = index;

    // Calculate item subtotal
    const itemSubtotal = (item.price * item.quantity).toFixed(2);
    const translatedTitle = i18nService.t(item.title);

    tr.innerHTML = `
      <!-- Remove button -->
      <td class="cart__remove">
        <button
          class="remove__btn"
          aria-label="Remove item"
          type="button"
          data-index="${index}"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>

      <!-- Product image -->
      <td>
        <img
          class="cart__item-media"
          src="${item.image || '../assets/images/cart-page/donut.png'}"
          alt="${translatedTitle}"
          loading="lazy"
        />
      </td>

      <!-- Product name -->
      <td data-label="Food">
        <span class="cart__item-name">${translatedTitle}</span>
      </td>

      <!-- Price -->
      <td data-label="Price" class="cart__price">
        $${item.price.toFixed(2)}
      </td>

      <!-- Quantity controls -->
      <td data-label="Quantity">
        <div class="cart__qty">
          <button 
            class="qty__btn qty__btn--minus" 
            aria-label="Decrease quantity"
            type="button"
            data-index="${index}"
          >
            −
          </button>
          <input 
            class="qty__input" 
            type="number" 
            value="${item.quantity}" 
            min="1" 
            max="99"
            data-index="${index}"
            aria-label="Quantity"
          />
          <button 
            class="qty__btn qty__btn--plus" 
            aria-label="Increase quantity"
            type="button"
            data-index="${index}"
          >
            +
          </button>
        </div>
      </td>

      <!-- Item subtotal -->
      <td data-label="Subtotal" class="cart__subtotal">
        $${itemSubtotal}
      </td>
    `;

    return tr;
  }

  /**
   * Update cart totals display
   */
  function updateCartTotals() {
    const items = getCartItems();
    const appliedCoupon = getAppliedCoupon();

    // Calculate amounts
    const subtotal = calculateSubtotal(items);
    const discount = calculateDiscount(subtotal, appliedCoupon);
    const total = calculateTotal(subtotal, discount);

    // Update subtotal
    const subtotalEl = document.querySelector('.totals__table tbody tr:nth-child(1) .totals__right');
    if (subtotalEl) {
      subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    }

    // Update discount
    const discountRow = document.querySelector('.totals__discount');
    if (discountRow) {
      const discountEl = discountRow.querySelector('.totals__right');
      if (discountEl) {
        if (discount > 0) {
          discountEl.innerHTML = `
            <span style="color: var(--color-dark-orange);">-${discount.toFixed(2)}</span>
            ${appliedCoupon ? `<br><small style="opacity: 0.7; font-size: 13px;">(${appliedCoupon.description})</small>` : ''}
          `;
          discountRow.style.display = 'table-row';
        } else {
          discountRow.style.display = 'none';
        }
      }
    }

    // Update total
    const totalEl = document.querySelector('.totals__total .totals__right');
    if (totalEl) {
      totalEl.textContent = `$${total.toFixed(2)}`;
    }

    // Update coupon display
    updateCouponDisplay(appliedCoupon);
  }

  /**
   * Update coupon input display
   * @param {Object} coupon - Applied coupon
   */
  function updateCouponDisplay(coupon) {
    const couponInput = document.querySelector('.coupon__input');
    const applyBtn = document.querySelector('.coupon .btn');

    if (!couponInput || !applyBtn) return;

    if (coupon) {
      // Show applied coupon
      couponInput.value = coupon.code;
      couponInput.disabled = true;
      couponInput.style.borderColor = 'var(--color-dark-orange)';
      couponInput.style.color = 'var(--color-dark-orange)';

      applyBtn.textContent = 'Remove';
      applyBtn.classList.remove('btn--brand');
      applyBtn.classList.add('btn--ghost');
      applyBtn.setAttribute('data-action', 'remove');
    } else {
      // Reset to default
      couponInput.value = '';
      couponInput.disabled = false;
      couponInput.style.borderColor = '';
      couponInput.style.color = '';

      applyBtn.textContent = 'Apply coupon';
      applyBtn.classList.add('btn--brand');
      applyBtn.classList.remove('btn--ghost');
      applyBtn.setAttribute('data-action', 'apply');
    }
  }

  /**
   * Show notification message
   * @param {String} message - Message to display
   * @param {String} type - Message type ('success' or 'error')
   */
  function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.cart__notification');
    if (existing) {
      existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `cart__notification cart__notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 24px;
      z-index: 9999;
      padding: 16px 24px;
      background: ${type === 'success' ? 'rgba(76, 175, 80, 0.95)' : 'rgba(244, 67, 54, 0.95)'};
      color: white;
      border-radius: 8px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
    `;

    // Add animation
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
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /* ========================================
   * EVENT HANDLERS
   * ======================================== */

  /**
   * Handle remove item from cart
   * @param {Number} index - Item index to remove
   */
  function handleRemoveItem(index) {
    const items = getCartItems();
    const removedItem = items[index];

    items.splice(index, 1);
    saveCartItems(items);

    renderCartItems(items);
    updateCartTotals();

    const translatedTitle = i18nService.t(removedItem.title);
    showNotification(`Removed "${translatedTitle}" from cart`, 'success');
  }

  /**
   * Handle quantity change
   * @param {Number} index - Item index
   * @param {Number} newQuantity - New quantity value
   */
  function handleQuantityChange(index, newQuantity) {
    const items = getCartItems();

    // Validate quantity
    newQuantity = parseInt(newQuantity);
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }
    if (newQuantity > 99) {
      newQuantity = 99;
    }

    items[index].quantity = newQuantity;
    saveCartItems(items);

    // Update only the affected row
    const row = document.querySelector(`tr[data-index="${index}"]`);
    if (row) {
      const item = items[index];
      const itemSubtotal = (item.price * item.quantity).toFixed(2);

      // Update quantity input
      const input = row.querySelector('.qty__input');
      if (input) input.value = newQuantity;

      // Update subtotal
      const subtotalCell = row.querySelector('.cart__subtotal');
      if (subtotalCell) subtotalCell.textContent = `${itemSubtotal}`;
    }

    updateCartTotals();
  }

  /**
   * Handle coupon application
   */
  function handleApplyCoupon() {
    const couponInput = document.querySelector('.coupon__input');
    const couponCode = couponInput.value.trim().toUpperCase();

    if (!couponCode) {
      showNotification('Please enter a coupon code', 'error');
      return;
    }

    const coupon = COUPONS[couponCode];

    if (!coupon) {
      showNotification('Invalid coupon code', 'error');
      couponInput.value = '';
      return;
    }

    // Save coupon
    saveAppliedCoupon({
      code: couponCode,
      ...coupon
    });

    updateCartTotals();
    showNotification(`Coupon applied: ${coupon.description}`, 'success');
  }

  /**
   * Handle coupon removal
   */
  function handleRemoveCoupon() {
    clearAppliedCoupon();
    updateCartTotals();
    showNotification('Coupon removed', 'success');
  }

  /**
   * Handle proceed to checkout
   */
  function handleProceedToCheckout() {
    const items = getCartItems();

    if (items.length === 0) {
      showNotification(i18nService.t('cart_page.notification.cart_empty_checkout'), 'error');
      return;
    }

    // Navigate to checkout page
    window.location.href = '../checkout-page/';
  }

  /* ========================================
   * EVENT LISTENERS SETUP
   * ======================================== */

  /**
   * Setup all event listeners
   */
  function setupEventListeners() {
    // Delegate events for dynamic cart items
    const tbody = document.querySelector('.cart__table tbody');
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const index = parseInt(target.dataset.index);

        // Remove button
        if (target.classList.contains('remove__btn')) {
          e.preventDefault();
          handleRemoveItem(index);
        }

        // Decrease quantity
        if (target.classList.contains('qty__btn--minus')) {
          e.preventDefault();
          const items = getCartItems();
          if (items[index]) {
            handleQuantityChange(index, items[index].quantity - 1);
          }
        }

        // Increase quantity
        if (target.classList.contains('qty__btn--plus')) {
          e.preventDefault();
          const items = getCartItems();
          if (items[index]) {
            handleQuantityChange(index, items[index].quantity + 1);
          }
        }
      });

      // Quantity input change
      tbody.addEventListener('input', (e) => {
        if (e.target.classList.contains('qty__input')) {
          const index = parseInt(e.target.dataset.index);
          const newQuantity = e.target.value;
          handleQuantityChange(index, newQuantity);
        }
      });
    }

    // Coupon button
    const couponBtn = document.querySelector('.coupon .btn');
    if (couponBtn) {
      couponBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = couponBtn.getAttribute('data-action');

        if (action === 'remove') {
          handleRemoveCoupon();
        } else {
          handleApplyCoupon();
        }
      });
    }

    // Proceed to checkout button
    const checkoutBtn = document.querySelector('.totals__footer .btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleProceedToCheckout();
      });
    }
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  /**
   * Initialize cart page
   */
  async function init() {
    // console.log('Initializing cart page...');

    // Show loader while initializing
    if (window.GlobalLoader) {
      window.GlobalLoader.show('Loading cart...');
    }

    await i18nService.init();

    // Small delay to ensure localStorage is readable
    setTimeout(() => {
      // Load and render cart items
      const items = getCartItems();
      // console.log('Cart items loaded:', items);

      renderCartItems(items);

      // Update totals
      updateCartTotals();

      // Setup event listeners
      setupEventListeners();

      // Hide loader
      if (window.GlobalLoader) {
        window.GlobalLoader.hide(300);
      }

      // console.log('Cart initialized with', items.length, 'items');
      // console.log('Available coupons:', Object.keys(COUPONS).join(', '));
    }, 100);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ========================================
   * PUBLIC API (for external use)
   * ======================================== */

  window.CartManager = {
    addItem: function (item) {
      const items = getCartItems();
      const existingIndex = items.findIndex(i => i.id === item.id);

      if (existingIndex >= 0) {
        items[existingIndex].quantity += (item.quantity || 1);
      } else {
        items.push({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          quantity: item.quantity || 1
        });
      }

      saveCartItems(items);
      return items;
    },

    getItems: getCartItems,
    getItemCount: function () {
      return getCartItems().reduce((total, item) => total + item.quantity, 0);
    },

    clearCart: function () {
      saveCartItems([]);
      clearAppliedCoupon();
    }
  };

})();
