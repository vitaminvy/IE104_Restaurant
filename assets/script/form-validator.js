// ================================
// UNIVERSAL FORM VALIDATION SYSTEM
// Real-time validation with animations
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
  };

  // ================================
  // VALIDATOR CLASS
  // ================================

  class FormValidator {
    constructor(formElement, options = {}) {
      this.form = formElement;
      this.options = {
        validateOnInput: options.validateOnInput !== false,
        validateOnBlur: options.validateOnBlur !== false,
        showSuccessIcons: options.showSuccessIcons !== false,
        animateErrors: options.animateErrors !== false,
        onSubmit: options.onSubmit || null,
        onValidationChange: options.onValidationChange || null,
      };

      this.fields = new Map();
      this.isValid = false;

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
          successElement: null,
          isValid: false,
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

      // Create error message element
      fieldData.errorElement = this.createErrorElement();
      element.parentElement.appendChild(fieldData.errorElement);

      // Create success icon if enabled
      if (this.options.showSuccessIcons) {
        fieldData.successElement = this.createSuccessElement();
        element.parentElement.appendChild(fieldData.successElement);
      }

      // Add wrapper class for styling
      element.parentElement.classList.add('form-field-validated');

      // Event listeners
      if (this.options.validateOnInput) {
        element.addEventListener('input', () => this.validateField(fieldData));
      }

      if (this.options.validateOnBlur) {
        element.addEventListener('blur', () => this.validateField(fieldData));
      }

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
      return errorEl;
    }

    createSuccessElement() {
      const successEl = document.createElement('div');
      successEl.className = 'form-field-success';
      successEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
          <path d="M6 10l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
      return successEl;
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

      // Custom validation from data attribute
      if (element.hasAttribute('data-validation')) {
        const customRule = element.getAttribute('data-validation');
        rules.push({ type: customRule });
      }

      return rules;
    }

    // ================================
    // FIELD VALIDATION
    // ================================

    validateField(fieldData) {
      const { element, rules, errorElement, successElement } = fieldData;
      const value = element.value;

      // Clear previous state
      this.clearFieldError(fieldData);

      // Skip validation if field is not required and empty
      if (!rules.some((r) => r.type === 'required') && value.trim() === '') {
        fieldData.isValid = true;
        return true;
      }

      // Run validation rules
      for (const rule of rules) {
        const isValid = this.runValidation(rule, value);

        if (!isValid) {
          this.showFieldError(fieldData, rule);
          fieldData.isValid = false;
          return false;
        }
      }

      // All validations passed
      this.showFieldSuccess(fieldData);
      fieldData.isValid = true;
      return true;
    }

    // ================================
    // RUN VALIDATION RULE
    // ================================

    runValidation(rule, value) {
      const validator = validationRules[rule.type];
      if (!validator) return true;

      if (rule.value !== undefined) {
        return validator(value, rule.value);
      }

      return validator(value);
    }

    // ================================
    // SHOW FIELD ERROR
    // ================================

    showFieldError(fieldData, rule) {
      const { element, errorElement } = fieldData;

      // Get error message
      let message = errorMessages[rule.type] || 'Invalid input';

      // Replace placeholders
      if (rule.value !== undefined) {
        message = message.replace(`{${rule.type.replace('Length', '')}}`, rule.value);
      }

      // Custom message from data attribute
      if (element.hasAttribute(`data-error-${rule.type}`)) {
        message = element.getAttribute(`data-error-${rule.type}`);
      }

      // Update UI
      element.classList.add('form-field-invalid');
      element.classList.remove('form-field-valid');
      element.setAttribute('aria-invalid', 'true');

      errorElement.textContent = message;
      errorElement.classList.add('show');

      // Shake animation if enabled
      if (this.options.animateErrors) {
        element.classList.add('shake-error');
        setTimeout(() => element.classList.remove('shake-error'), 500);
      }

      // Notify change
      if (this.options.onValidationChange) {
        this.options.onValidationChange(this.checkFormValidity());
      }
    }

    // ================================
    // SHOW FIELD SUCCESS
    // ================================

    showFieldSuccess(fieldData) {
      const { element, successElement } = fieldData;

      element.classList.add('form-field-valid');
      element.classList.remove('form-field-invalid');
      element.setAttribute('aria-invalid', 'false');

      if (successElement) {
        successElement.classList.add('show');
      }

      // Notify change
      if (this.options.onValidationChange) {
        this.options.onValidationChange(this.checkFormValidity());
      }
    }

    // ================================
    // CLEAR FIELD ERROR
    // ================================

    clearFieldError(fieldData) {
      const { element, errorElement, successElement } = fieldData;

      element.classList.remove('form-field-invalid', 'form-field-valid', 'shake-error');
      element.removeAttribute('aria-invalid');

      if (errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
      }

      if (successElement) {
        successElement.classList.remove('show');
      }
    }

    // ================================
    // FORM VALIDATION
    // ================================

    validateForm() {
      let isValid = true;

      this.fields.forEach((fieldData) => {
        const fieldValid = this.validateField(fieldData);
        if (!fieldValid) {
          isValid = false;
        }
      });

      this.isValid = isValid;
      return isValid;
    }

    checkFormValidity() {
      let isValid = true;

      this.fields.forEach((fieldData) => {
        if (!fieldData.isValid) {
          isValid = false;
        }
      });

      this.isValid = isValid;
      return isValid;
    }

    // ================================
    // FORM SUBMISSION
    // ================================

    handleSubmit(event) {
      event.preventDefault();

      const isValid = this.validateForm();

      if (isValid) {
        // Execute custom submit handler
        if (this.options.onSubmit) {
          this.options.onSubmit(this.form, this.getFormData());
        }
      } else {
        // Focus first invalid field
        const firstInvalid = Array.from(this.fields.values()).find((f) => !f.isValid);
        if (firstInvalid) {
          firstInvalid.element.focus();
        }
      }
    }

    // ================================
    // UTILITY METHODS
    // ================================

    getFormData() {
      const formData = new FormData(this.form);
      const data = {};

      formData.forEach((value, key) => {
        data[key] = value;
      });

      return data;
    }

    reset() {
      this.form.reset();
      this.fields.forEach((fieldData) => {
        this.clearFieldError(fieldData);
        fieldData.isValid = false;
      });
      this.isValid = false;
    }

    destroy() {
      this.fields.forEach((fieldData) => {
        if (fieldData.errorElement) {
          fieldData.errorElement.remove();
        }
        if (fieldData.successElement) {
          fieldData.successElement.remove();
        }
        fieldData.element.parentElement.classList.remove('form-field-validated');
      });

      this.fields.clear();
    }
  }

  // ================================
  // GLOBAL API
  // ================================

  window.FormValidator = FormValidator;
})();
