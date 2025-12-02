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
    const submitButton = form.querySelector('button[type="submit"]');

    // Disable button and show loading state
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = window.i18nService.t('contact_us.form.sending');

    // Simulate API call (replace with actual backend call)
    setTimeout(() => {
      // Success
      const successMessage = window.i18nService.t('notifications.contactSuccess').replace('{name}', formData.name);
      NotificationSystem.success(successMessage, {
        duration: 5000,
      });

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
