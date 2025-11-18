import i18nService from '../../assets/script/i18n-service.js';

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

    // Wait for i18nService to be initialized
    i18nService.init().then(() => {
      // Initialize form validator
      const validator = new FormValidator(form, {
        onSubmit: handleCheckoutSubmit,
      });
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
      NotificationSystem.error(i18nService.t('checkout_page.notifications.select_payment'), {
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

    // Disable button and show loading state
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = i18nService.t('checkout_page.notifications.processing');

    // Simulate API call (replace with actual backend call)
    setTimeout(() => {
      // Success
      const orderId = Math.floor(Math.random() * 100000);
      NotificationSystem.success(
        i18nService.t('checkout_page.notifications.order_placed_success', { orderId }),
        {
          duration: 6000,
        }
      );

      // Optionally redirect to order confirmation page
      // window.location.href = '/order-confirmation.html';

      // Reset button (if not redirecting)
      submitButton.disabled = false;
      submitButton.textContent = originalText;
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
