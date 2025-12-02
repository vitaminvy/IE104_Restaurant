import i18nService from '../../assets/script/i18n-service.js';

// ================================
// RESERVATION FORM HANDLER
// Initialize validation and handle submission
// ================================

(function () {
  'use strict';

  const HISTORY_STORAGE_KEY = 'activityHistory';
  const HISTORY_LIMIT = 50;

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
      const arrivalAt = buildArrivalDate(formData.date, formData.time);
      const guestName = formData.name || formData['no-history-12345'] || 'Khách';
      const reservationId = `R${Math.floor(Math.random() * 100000)}`;

      appendReservationHistory({
        id: reservationId,
        type: 'reservation',
        status: 'pending',
        createdAt: new Date().toISOString(),
        arrivalAt,
        people: Number(formData.people) || 1,
        table: '',
        note: '',
        contact: {
          name: guestName,
          phone: formData.phone || '',
          email: formData.email || '',
        },
      });

      // Success
      const successMessageTemplate = i18nService.t('home.reservation.success_toast');
      const successMessage = successMessageTemplate
        .replace('{name}', guestName)
        .replace('{date}', formatDate(formData.date))
        .replace('{time}', formatTime(formData.time));

      NotificationSystem.success(
        successMessage,
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

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function saveHistory(items) {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // no-op
    }
  }

  function appendReservationHistory(entry) {
    const existing = loadHistory();
    existing.unshift(entry);
    const trimmed = existing.slice(0, HISTORY_LIMIT);
    saveHistory(trimmed);
  }

  function buildArrivalDate(dateValue, timeValue) {
    if (!dateValue || !timeValue) return '';
    const isoString = `${dateValue}T${timeValue}:00`;
    const date = new Date(isoString);
    return date.toISOString();
  }

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
