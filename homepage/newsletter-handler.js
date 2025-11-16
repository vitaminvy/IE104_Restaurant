// ================================
// NEWSLETTER FORM HANDLER
// Initialize validation and handle newsletter subscription
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
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    // Initialize form validator
    const validator = new FormValidator(form, {
      onSubmit: handleNewsletterSubmit,
    });
  }

  // ================================
  // HANDLE FORM SUBMISSION
  // ================================

  function handleNewsletterSubmit(form, formData) {
    const submitButton = form.querySelector('.newsletter__submit');

    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    // Simulate API call (replace with actual backend call)
    setTimeout(() => {
      // Success
      NotificationSystem.success(
        `Thank you for subscribing! Check your inbox at ${formData.email} for confirmation.`,
        {
          duration: 5000,
        }
      );

      // Reset form
      form.reset();

      // Reset button
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';

      // Clear validation states
      const fields = form.querySelectorAll('.form-field-invalid');
      fields.forEach((field) => {
        field.classList.remove('form-field-invalid');
      });
    }, 1500);
  }
})();
