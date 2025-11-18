import i18nService from '../../assets/script/i18n-service.js';

(async function () {
  'use strict';

  await i18nService.init();
  document.dispatchEvent(new CustomEvent('language-changed'));

  /* ========================================
   * CONFIGURATION & CONSTANTS
   * ======================================== */

  const CART_STORAGE_KEY = 'restaurantCart';
  const COUPON_STORAGE_KEY = 'restaurant_applied_coupon';
  const SHIPPING_COST = 6.00; // Flat rate shipping

  /* ========================================
   * CART STATE MANAGEMENT
   * ======================================== */

  function getCartItems() {
    try {
      const items = localStorage.getItem(CART_STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

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

  function calculateSubtotal(items) {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  }

  function calculateDiscount(subtotal, coupon) {
    if (!coupon) return 0;

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.discount / 100);
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.discount, subtotal);
    }
    return discount;
  }

  function calculateTotal(subtotal, discount, shipping) {
    return Math.max(0, subtotal - discount + shipping);
  }

  /* ========================================
   * DOM MANIPULATION
   * ======================================== */

  function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
  }

  function renderOrderItems(items) {
    const tbody = document.querySelector('.order-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    items.forEach(item => {
      const tr = document.createElement('tr');
      const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
      
      tr.innerHTML = `
        <td>${i18nService.t(item.title)} × ${item.quantity}</td>
        <td>${formatCurrency(itemTotal)}</td>
      `;
      
      tbody.appendChild(tr);
    });
  }

  function updateOrderTotals(subtotal, discount, coupon, shipping, total) {
    const tfoot = document.querySelector('.order-table tfoot');
    if (!tfoot) return;

    let shippingText = i18nService.t('checkout_page.order_summary.shipping_rate');
    
    if (coupon && coupon.type === 'freeship') {
      shippingText = `<span style="text-decoration: line-through; color: #999;">${i18nService.t('checkout_page.order_summary.shipping_rate')}</span> <span style="color: #4CAF50; font-weight: 600;">${i18nService.t('checkout_page.notifications.free_shipping')}</span>`;
      shipping = 0;
      total = subtotal - discount;
    }

    let footerHTML = `
      <tr>
        <th>${i18nService.t('checkout_page.order_summary.subtotal_footer')}</th>
        <td>${formatCurrency(subtotal)}</td>
      </tr>
    `;

    if (discount > 0) {
      footerHTML += `
        <tr class="discount-row">
          <th>${i18nService.t('cart_page.totals.discount')}</th>
          <td style="color: #4CAF50; font-weight: 600;">-${formatCurrency(discount)}</td>
        </tr>
      `;
    }

    if (coupon && coupon.description) {
      footerHTML += `
        <tr class="">
          <th style="color: #4CAF50; font-size: 0.9em;">${i18nService.t('checkout_page.notifications.coupon_applied')}</th>
          <td style="color: #4CAF50; font-size: 0.9em;">${coupon.code}: ${coupon.description}</td>
        </tr>
      `;
    }

    footerHTML += `
      <tr>
        <th>${i18nService.t('checkout_page.order_summary.shipping')}</th>
        <td>${shippingText}</td>
      </tr>
      <tr class="order-table__total">
        <th>${i18nService.t('checkout_page.order_summary.total')}</th>
        <td>${formatCurrency(total)}</td>
      </tr>
    `;

    tfoot.innerHTML = footerHTML;
  }

  function showNotification(message, type = 'info') {
    const existing = document.querySelector('.checkout-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `checkout-notification checkout-notification--${type}`;
    notification.textContent = message;
    
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

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);

    notification.addEventListener('click', () => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    });
  }

  function handleEmptyCart() {
    showNotification(i18nService.t('checkout_page.notifications.cart_empty_redirect'), 'info');
    
    setTimeout(() => {
      window.location.href = '../cartpage/';
    }, 2000);
  }

  /* ========================================
   * FORM VALIDATION & ORDER PLACEMENT
   * ======================================== */

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

    const emailField = form.querySelector('#email');
    if (emailField && emailField.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        emailField.style.borderColor = '#f44336';
        isValid = false;
        showNotification(i18nService.t('checkout_page.notifications.invalid_email'), 'error');
      }
    }

    const phoneField = form.querySelector('#phone');
    if (phoneField && phoneField.value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phoneField.value) || phoneField.value.length < 10) {
        phoneField.style.borderColor = '#f44336';
        isValid = false;
        showNotification(i18nService.t('checkout_page.notifications.invalid_phone'), 'error');
      }
    }

    const paymentSelected = form.querySelector('input[name="payment"]:checked');
    if (!paymentSelected) {
      isValid = false;
      showNotification(i18nService.t('checkout_page.notifications.select_payment'), 'error');
    }

    return isValid;
  }

  function handlePlaceOrder(e) {
    e.preventDefault();
    
    const form = e.target;
    
    if (!validateForm(form)) {
      return;
    }

    const items = getCartItems();
    if (items.length === 0) {
      handleEmptyCart();
      return;
    }

    const coupon = getAppliedCoupon();
    const subtotal = calculateSubtotal(items);
    const discount = calculateDiscount(subtotal, coupon);
    let shipping = SHIPPING_COST;
    
    if (coupon && coupon.type === 'freeship') {
      shipping = 0;
    }
    
    const total = calculateTotal(subtotal, discount, shipping);

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

    console.log('Order placed:', formData);

    const orderId = Math.floor(Math.random() * 100000);
    const successMsg = i18nService.t('checkout_page.notifications.order_placed_success').replace('#{orderId}', orderId);
    showNotification(successMsg, 'success');

    setTimeout(() => {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
      
      showNotification(i18nService.t('checkout_page.notifications.redirecting_homepage'), 'info');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 2000);
    }, 2000);
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  function renderCheckoutSummary() {
    const items = getCartItems();
    if (items.length === 0) {
      return false;
    }

    const coupon = getAppliedCoupon();
    const subtotal = calculateSubtotal(items);
    const discount = calculateDiscount(subtotal, coupon);
    let shipping = SHIPPING_COST;

    if (coupon && coupon.type === 'freeship') {
      shipping = 0;
    }

    const total = calculateTotal(subtotal, discount, shipping);

    renderOrderItems(items);
    updateOrderTotals(subtotal, discount, coupon, shipping, total);

    return true;
  }

  function initCheckout() {
    const hasItems = renderCheckoutSummary();
    if (!hasItems) {
      handleEmptyCart();
      return;
    }

    const form = document.querySelector('.form');
    if (form) {
      form.addEventListener('submit', handlePlaceOrder);
    }

    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      field.addEventListener('blur', () => {
        if (field.value.trim()) {
          field.style.borderColor = '';
        }
      });
    });

    console.log('Checkout initialized with', getCartItems().length, 'item(s)');
  }

  /* ========================================
   * AUTO-INITIALIZE ON DOM READY
   * ======================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
  } else {
    initCheckout();
  }

  document.addEventListener('language-changed', () => {
    renderCheckoutSummary();
  });

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
