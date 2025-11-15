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
      validateOnInput: true,
      validateOnBlur: true,
      showSuccessIcons: true,
      animateErrors: true,
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

    // Disable button and show loading state
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing...';

    // Simulate API call (replace with actual backend call)
    setTimeout(() => {
      // Success
      NotificationSystem.success(
        `Order placed successfully! Your order will be ${getPaymentMethodText(paymentMethod.value)}.`,
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
