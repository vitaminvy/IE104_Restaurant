/**
 * Authentication Form Validation Utilities
 * Matches restaurant app design system
 */

// ========== Validation Rules ==========

const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  },
  name: {
    minLength: 2,
    pattern: /^[\p{L}\s]+$/u, // allow unicode letters (e.g., Vietnamese) and spaces
    message: 'Name must contain only letters and spaces',
  },
  otp: {
    length: 6,
    pattern: /^\d{6}$/,
    message: 'Please enter a valid 6-digit OTP',
  },
};

// ========== Validation Functions ==========

export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email is required' };
  }

  if (!ValidationRules.email.pattern.test(email)) {
    return { valid: false, message: ValidationRules.email.message };
  }

  return { valid: true, message: '' };
}

export function validatePassword(password) {
  if (!password || password.trim() === '') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < ValidationRules.password.minLength) {
    return { valid: false, message: `Password must be at least ${ValidationRules.password.minLength} characters` };
  }

  if (!ValidationRules.password.pattern.test(password)) {
    return { valid: false, message: ValidationRules.password.message };
  }

  return { valid: true, message: '' };
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { valid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }

  return { valid: true, message: '' };
}

export function validateName(name) {
  if (!name || name.trim() === '') {
    return { valid: false, message: 'Name is required' };
  }

  if (name.length < ValidationRules.name.minLength) {
    return { valid: false, message: `Name must be at least ${ValidationRules.name.minLength} characters` };
  }

  if (!ValidationRules.name.pattern.test(name)) {
    return { valid: false, message: ValidationRules.name.message };
  }

  return { valid: true, message: '' };
}

export function validateOTP(otp) {
  if (!otp || otp.trim() === '') {
    return { valid: false, message: 'OTP is required' };
  }

  if (otp.length !== ValidationRules.otp.length) {
    return { valid: false, message: `OTP must be ${ValidationRules.otp.length} digits` };
  }

  if (!ValidationRules.otp.pattern.test(otp)) {
    return { valid: false, message: ValidationRules.otp.message };
  }

  return { valid: true, message: '' };
}

// ========== Form Validation ==========

export function validateLoginForm(formData) {
  const errors = {};

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.message;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegisterForm(formData) {
  const errors = {};

  const nameValidation = validateName(formData.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.message;
  }

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.message;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message;
  }

  const confirmPasswordValidation = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
  if (!confirmPasswordValidation.valid) {
    errors.confirmPassword = confirmPasswordValidation.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateForgotPasswordForm(formData) {
  const errors = {};

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateNewPasswordForm(formData) {
  const errors = {};

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message;
  }

  const confirmPasswordValidation = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
  if (!confirmPasswordValidation.valid) {
    errors.confirmPassword = confirmPasswordValidation.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ========== Real-time Field Validation ==========

export function validateField(fieldName, value, formData = {}) {
  switch (fieldName) {
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'confirmPassword':
      return validateConfirmPassword(formData.password, value);
    case 'name':
      return validateName(value);
    case 'otp':
      return validateOTP(value);
    default:
      return { valid: true, message: '' };
  }
}

// ========== Password Strength Calculator ==========

export function calculatePasswordStrength(password) {
  let strength = 0;

  if (!password) return { strength: 0, label: '', color: '' };

  // Length check
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;

  // Character variety checks
  if (/[a-z]/.test(password)) strength += 12.5;
  if (/[A-Z]/.test(password)) strength += 12.5;
  if (/\d/.test(password)) strength += 12.5;
  if (/[^a-zA-Z\d]/.test(password)) strength += 12.5;

  // Determine label and color
  let label = '';
  let color = '';

  if (strength < 30) {
    label = 'Weak';
    color = '#ef4444';
  } else if (strength < 60) {
    label = 'Fair';
    color = '#f59e0b';
  } else if (strength < 80) {
    label = 'Good';
    color = '#3b82f6';
  } else {
    label = 'Strong';
    color = '#22c55e';
  }

  return { strength, label, color };
}

// ========== Helper Functions ==========

export function showFieldError(inputElement, message) {
  const formGroup = inputElement.closest('.auth-form-group');
  if (!formGroup) return;

  inputElement.classList.add('error');
  inputElement.classList.remove('success');

  // Remove existing error message
  const existingError = formGroup.querySelector('.auth-error-message');
  if (existingError) {
    existingError.remove();
  }

  // Add new error message
  if (message) {
    const errorElement = document.createElement('p');
    errorElement.className = 'auth-error-message';
    errorElement.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      ${message}
    `;
    formGroup.appendChild(errorElement);
  }
}

export function showFieldSuccess(inputElement) {
  const formGroup = inputElement.closest('.auth-form-group');
  if (!formGroup) return;

  inputElement.classList.remove('error');
  inputElement.classList.add('success');

  // Remove error message
  const existingError = formGroup.querySelector('.auth-error-message');
  if (existingError) {
    existingError.remove();
  }
}

export function clearFieldValidation(inputElement) {
  const formGroup = inputElement.closest('.auth-form-group');
  if (!formGroup) return;

  inputElement.classList.remove('error', 'success');

  const existingError = formGroup.querySelector('.auth-error-message');
  if (existingError) {
    existingError.remove();
  }
}

export function showAlert(container, type, message) {
  // Remove existing alerts
  const existingAlert = container.querySelector('.auth-alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  const alertElement = document.createElement('div');
  alertElement.className = `auth-alert auth-alert--${type}`;

  const icon = type === 'error'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <circle cx="12" cy="12" r="10"></circle>
         <line x1="15" y1="9" x2="9" y2="15"></line>
         <line x1="9" y1="9" x2="15" y2="15"></line>
       </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
         <polyline points="22 4 12 14.01 9 11.01"></polyline>
       </svg>`;

  alertElement.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.insertBefore(alertElement, container.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alertElement.parentNode) {
      alertElement.remove();
    }
  }, 5000);
}
