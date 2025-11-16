// ================================
// UNIVERSAL FORM VALIDATION SYSTEM
// Submit-only validation with minimal UI feedback
// ================================

(function () {
  'use strict';

  // ================================
  // VALIDATION RULES
  // ================================

  const validationRules = {
    required: (value) => value.trim() !== '',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value) => /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
    minLength: (value, min) => value.length >= min,
    maxLength: (value, max) => value.length <= max,
    number: (value) => !isNaN(value) && value.trim() !== '',
    date: (value) => !isNaN(Date.parse(value)),
    time: (value) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
    pattern: (value, pattern) => new RegExp(pattern).test(value),
  };

  // ================================
  // ERROR MESSAGES
  // ================================

  const errorMessages = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    minLength: 'Minimum {min} characters required',
    maxLength: 'Maximum {max} characters allowed',
    number: 'Please enter a valid number',
    date: 'Please enter a valid date',
    time: 'Please enter a valid time',
    pattern: 'Invalid format',
  };

  // ================================
  // VALIDATOR CLASS
  // ================================

  class FormValidator {
    constructor(formElement, options = {}) {
      this.form = formElement;
      this.options = {
        onSubmit: options.onSubmit || null,
      };

      this.fields = new Map();
      this.init();
    }

    // ================================
    // INITIALIZATION
    // ================================

    init() {
      // Find all validatable fields
      const inputs = this.form.querySelectorAll('input, textarea, select');

      inputs.forEach((input) => {
        // Skip non-validatable fields
        if (input.type === 'submit' || input.type === 'button') return;

        const fieldData = {
          element: input,
          rules: this.getFieldRules(input),
          errorElement: null,
        };

        this.fields.set(input.name || input.id, fieldData);
        this.setupField(fieldData);
      });

      // Setup form submission
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // ================================
    // FIELD SETUP
    // ================================

    setupField(fieldData) {
      const { element } = fieldData;

      // Create error message element (hidden by default)
      fieldData.errorElement = this.createErrorElement();
      element.parentElement.appendChild(fieldData.errorElement);

      // Add wrapper class for styling
      element.parentElement.classList.add('form-field-validated');

      // Clear error on focus
      element.addEventListener('focus', () => this.clearFieldError(fieldData));
    }

    // ================================
    // UI ELEMENT CREATION
    // ================================

    createErrorElement() {
      const errorEl = document.createElement('div');
      errorEl.className = 'form-field-error';
      errorEl.setAttribute('role', 'alert');
      errorEl.setAttribute('aria-live', 'polite');
      errorEl.style.display = 'none';
      return errorEl;
    }

    // ================================
    // GET FIELD VALIDATION RULES
    // ================================

    getFieldRules(element) {
      const rules = [];

      // Required
      if (element.hasAttribute('required')) {
        rules.push({ type: 'required' });
      }

      // Email
      if (element.type === 'email') {
        rules.push({ type: 'email' });
      }

      // Phone
      if (element.type === 'tel') {
        rules.push({ type: 'phone' });
      }

      // Number
      if (element.type === 'number') {
        rules.push({ type: 'number' });
      }

      // Date
      if (element.type === 'date') {
        rules.push({ type: 'date' });
      }

      // Time
      if (element.type === 'time') {
        rules.push({ type: 'time' });
      }

      // Min/Max length
      if (element.hasAttribute('minlength')) {
        rules.push({
          type: 'minLength',
          value: parseInt(element.getAttribute('minlength')),
        });
      }

      if (element.hasAttribute('maxlength')) {
        rules.push({
          type: 'maxLength',
          value: parseInt(element.getAttribute('maxlength')),
        });
      }

      // Pattern
      if (element.hasAttribute('pattern')) {
        rules.push({
          type: 'pattern',
          value: element.getAttribute('pattern'),
        });
      }

      return rules;
    }

    // ================================
    // FIELD VALIDATION
    // ================================

    validateField(fieldData) {
      const { element, rules, errorElement } = fieldData;
      const value = element.value;

      // Clear previous state
      this.clearFieldError(fieldData);

      // Skip validation if field is not required and empty
      if (!rules.some((r) => r.type === 'required') && value.trim() === '') {
        return true;
      }

      // Validate each rule
      for (const rule of rules) {
        let isValid = false;
        let errorMsg = '';

        switch (rule.type) {
          case 'required':
            isValid = validationRules.required(value);
            errorMsg = element.getAttribute('data-error-required') || errorMessages.required;
            break;

          case 'email':
            isValid = validationRules.email(value);
            errorMsg = element.getAttribute('data-error-email') || errorMessages.email;
            break;

          case 'phone':
            isValid = validationRules.phone(value);
            errorMsg = element.getAttribute('data-error-phone') || errorMessages.phone;
            break;

          case 'minLength':
            isValid = validationRules.minLength(value, rule.value);
            errorMsg = element.getAttribute('data-error-minLength') ||
                      errorMessages.minLength.replace('{min}', rule.value);
            break;

          case 'maxLength':
            isValid = validationRules.maxLength(value, rule.value);
            errorMsg = element.getAttribute('data-error-maxLength') ||
                      errorMessages.maxLength.replace('{max}', rule.value);
            break;

          case 'number':
            isValid = validationRules.number(value);
            errorMsg = element.getAttribute('data-error-number') || errorMessages.number;
            break;

          case 'date':
            isValid = validationRules.date(value);
            errorMsg = element.getAttribute('data-error-date') || errorMessages.date;
            break;

          case 'time':
            isValid = validationRules.time(value);
            errorMsg = element.getAttribute('data-error-time') || errorMessages.time;
            break;

          case 'pattern':
            isValid = validationRules.pattern(value, rule.value);
            errorMsg = element.getAttribute('data-error-pattern') || errorMessages.pattern;
            break;
        }

        // If validation fails, show error
        if (!isValid) {
          this.showFieldError(fieldData, errorMsg);
          return false;
        }
      }

      return true;
    }

    // ================================
    // SHOW/HIDE ERRORS
    // ================================

    showFieldError(fieldData, message) {
      const { element, errorElement } = fieldData;

      // Add invalid class (simple red border)
      element.classList.add('form-field-invalid');
      element.classList.remove('form-field-valid');

      // Show error message
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }

    clearFieldError(fieldData) {
      const { element, errorElement } = fieldData;

      // Remove invalid class
      element.classList.remove('form-field-invalid', 'form-field-valid');

      // Hide error message
      if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
      }
    }

    // ================================
    // FORM SUBMISSION
    // ================================

    handleSubmit(event) {
      event.preventDefault();

      // Clear all previous errors
      this.fields.forEach((fieldData) => {
        this.clearFieldError(fieldData);
      });

      // Validate all fields
      let isFormValid = true;
      let firstInvalidField = null;

      this.fields.forEach((fieldData) => {
        const isValid = this.validateField(fieldData);
        if (!isValid) {
          isFormValid = false;
          if (!firstInvalidField) {
            firstInvalidField = fieldData.element;
          }
        }
      });

      // Focus first invalid field
      if (!isFormValid && firstInvalidField) {
        firstInvalidField.focus();
        return;
      }

      // If valid, collect form data and call onSubmit callback
      if (isFormValid && this.options.onSubmit) {
        const formData = this.getFormData();
        this.options.onSubmit(this.form, formData);
      }
    }

    // ================================
    // GET FORM DATA
    // ================================

    getFormData() {
      const data = {};

      this.fields.forEach((fieldData, fieldName) => {
        const { element } = fieldData;
        data[fieldName] = element.value;
      });

      return data;
    }

    // ================================
    // PUBLIC METHODS
    // ================================

    reset() {
      this.form.reset();
      this.fields.forEach((fieldData) => {
        this.clearFieldError(fieldData);
      });
    }

    validate() {
      let isFormValid = true;

      this.fields.forEach((fieldData) => {
        const isValid = this.validateField(fieldData);
        if (!isValid) {
          isFormValid = false;
        }
      });

      return isFormValid;
    }
  }

  // ================================
  // EXPORT TO GLOBAL SCOPE
  // ================================

  window.FormValidator = FormValidator;
})();
