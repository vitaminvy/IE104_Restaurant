// ================================
// CHECKOUT FORM HANDLER
// Initialize validation and handle order submission
// ================================

(function () {
  'use strict';

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    // Initialize form validator
    const validator = new FormValidator(form, {
      onSubmit: handleCheckoutSubmit,
    });
  }

  // ================================
  // HANDLE FORM SUBMISSION
  // ================================

  function handleCheckoutSubmit(form, formData) {
    const submitButton = form.querySelector('.checkout-form__btn');

    // Validate payment method selection
    const paymentMethod = form.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
      NotificationSystem.error('Please select a payment method', {
        duration: 4000,
      });

      // Add shake animation to payment section
      const paymentSection = form.querySelector('.payment');
      if (paymentSection) {
        paymentSection.classList.add('shake-error');
        setTimeout(() => {
          paymentSection.classList.remove('shake-error');
        }, 500);
      }
      return;
    }

    // Get cart items and calculate totals
    const CART_STORAGE_KEY = 'restaurantCart';
    const COUPON_STORAGE_KEY = 'restaurant_applied_coupon';
    const SHIPPING_COST = 6.00;

    let cart = [];
    let coupon = null;

    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      cart = cartData ? JSON.parse(cartData) : [];

      const couponData = localStorage.getItem(COUPON_STORAGE_KEY);
      coupon = couponData ? JSON.parse(couponData) : null;
    } catch (error) {
      console.error('Error loading cart/coupon:', error);
    }

    if (cart.length === 0) {
      NotificationSystem.error('Your cart is empty', { duration: 3000 });
      setTimeout(() => {
        window.location.href = '../cartpage/cart.html';
      }, 2000);
      return;
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
    }, 0);

    let discount = 0;
    if (coupon) {
      if (coupon.type === 'percentage') {
        discount = subtotal * (coupon.discount / 100);
      } else if (coupon.type === 'fixed') {
        discount = Math.min(coupon.discount, subtotal);
      }
    }

    let shipping = SHIPPING_COST;
    if (coupon && coupon.type === 'freeship') {
      shipping = 0;
    }

    const total = Math.max(0, subtotal - discount + shipping);

    // Disable button and show loading state
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing...';

    // Generate unique order ID
    const orderId = 'ORD-' + Date.now();

    // Collect delivery address from formData
    const deliveryAddress = {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      country: formData.country || '',
      street1: formData.street1 || '',
      street2: formData.street2 || '',
      city: formData.city || '',
      district: formData.district || '',
      zip: formData.zip || '',
      phone: formData.phone || '',
      email: formData.email || '',
    };

    // Create order object
    const orderData = {
      id: orderId,
      items: cart,
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      total: total,
      couponCode: coupon ? coupon.code : null,
      paymentMethod: paymentMethod.value,
      deliveryAddress: deliveryAddress,
      status: 'placed', // Initial status for order tracking
      placedAt: Date.now(),
      deliveredAt: null
    };

    // Save order to history using OrderHistoryManager
    if (window.OrderHistoryManager) {
      try {
        window.OrderHistoryManager.saveOrder(orderData);
        console.log('✅ Order saved to history:', orderId);
      } catch (error) {
        console.error('❌ Error saving order:', error);
      }
    } else {
      console.warn('⚠️ OrderHistoryManager not available');
    }

    // Simulate API call (replace with actual backend call)
    setTimeout(() => {
      // Success
      NotificationSystem.success(
        `Order placed successfully! Order ID: ${orderId}`,
        {
          duration: 6000,
        }
      );

      // Clear cart and coupon
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);

      // Emit cart updated event to update header badge
      if (window.EventBus && typeof window.EventBus.emit === 'function') {
        window.EventBus.emit('cart:updated', { cart: [] });
      }

      // Manually update cart badge if EventBus is not available
      const cartBadge = document.querySelector('.cart-count');
      if (cartBadge) {
        cartBadge.textContent = '0';
        cartBadge.style.display = 'none';
      }

      // Redirect to order tracking page
      setTimeout(() => {
        window.location.href = '../order-tracking-page/index.html';
      }, 1500);
    }, 2000);
  }

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  function getPaymentMethodText(method) {
    const paymentTexts = {
      bank: 'processed via bank transfer',
      check: 'processed after check verification',
      cod: 'paid on delivery',
      paypal: 'processed through PayPal',
    };
    return paymentTexts[method] || 'processed';
  }
})();
