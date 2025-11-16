// ================================
// RESERVATION FORM HANDLER
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
    const form = document.getElementById('reservation-form');
    if (!form) return;

    // Initialize form validator
    const validator = new FormValidator(form, {
      onSubmit: handleReservationSubmit,
    });
  }

  // ================================
  // HANDLE FORM SUBMISSION
  // ================================

  function handleReservationSubmit(form, formData) {
    const submitButton = form.querySelector('.reservation__btn');

    // Disable button and show loading state
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Reserving...';

    // Simulate API call (replace with actual backend call)
    setTimeout(() => {
      // Success
      NotificationSystem.success(
        `Table reserved successfully for ${formData.name} on ${formatDate(formData.date)} at ${formatTime(formData.time)}!`,
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

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
})();
