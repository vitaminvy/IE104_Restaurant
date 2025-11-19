// ================================
// CONTACT FORM HANDLER
// Initialize validation and handle submission
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
    const form = document.querySelector('.contact-form__form');
    if (!form) return;

    // Initialize form validator
    const validator = new FormValidator(form, {
      onSubmit: handleContactSubmit,
    });
  }

  // ================================
  // HANDLE FORM SUBMISSION
  // ================================

  function handleContactSubmit(form, formData) {
    const submitButton = form.querySelector('.contact-form__btn');

    // Disable button and show loading state
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';

    // Simulate API call (replace with actual backend call)
    setTimeout(() => {
      // Success
      NotificationSystem.success(
        `Thank you ${formData.name}! Your message has been sent successfully. We'll get back to you soon.`,
        {
          duration: 5000,
        }
      );

      // Reset form
      form.reset();

      // Reset button
      submitButton.disabled = false;
      submitButton.textContent = originalText;

      // Clear validation states
      const fields = form.querySelectorAll('.form-field-invalid');
      fields.forEach((field) => {
        field.classList.remove('form-field-invalid');
      });
    }, 1500);
  }
})();
