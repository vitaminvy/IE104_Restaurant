/**
 * New Password Page Logic
 * Matches restaurant app design system
 */

import {
  validateNewPasswordForm,
  validateField,
  calculatePasswordStrength,
  showFieldError,
  showFieldSuccess,
  clearFieldValidation,
  showAlert,
} from '../auth-validation.js';

// ========== DOM Elements ==========

const newPasswordForm = document.getElementById('new-password-form');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const changePasswordBtn = document.getElementById('change-password-btn');
const alertContainer = document.getElementById('alert-container');
const passwordStrengthContainer = document.getElementById('password-strength');
const passwordStrengthFill = document.getElementById('password-strength-fill');
const passwordStrengthText = document.getElementById('password-strength-text');

// ========== Verify Reset Token ==========

function verifyResetToken() {
  const resetToken = sessionStorage.getItem('resetToken');
  const email = sessionStorage.getItem('resetEmail');

  if (!resetToken || !email) {
    showAlert(
      alertContainer,
      'error',
      'Session expired. Please start the password reset process again.'
    );
    setTimeout(() => {
      window.location.href = '../forgot-password/';
    }, 2000);
    return false;
  }

  return true;
}

// ========== Password Toggle ==========

function setupPasswordToggle() {
  const toggleButtons = document.querySelectorAll('.auth-password-toggle');

  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      const input = document.getElementById(targetId);
      const eyeIcon = button.querySelector('.eye-icon');
      const eyeOffIcon = button.querySelector('.eye-off-icon');

      if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
      } else {
        input.type = 'password';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
      }
    });
  });
}

// ========== Password Strength Indicator ==========

function updatePasswordStrength() {
  const password = passwordInput.value;

  if (!password) {
    passwordStrengthContainer.classList.remove('show');
    return;
  }

  passwordStrengthContainer.classList.add('show');

  const { strength, label, color } = calculatePasswordStrength(password);

  // Update progress bar
  passwordStrengthFill.style.width = `${strength}%`;
  passwordStrengthFill.style.backgroundColor = color;

  // Update text
  const icon =
    strength < 30
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
           <circle cx="12" cy="12" r="10"></circle>
           <line x1="12" y1="8" x2="12" y2="12"></line>
           <line x1="12" y1="16" x2="12.01" y2="16"></line>
         </svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
           <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
           <polyline points="22 4 12 14.01 9 11.01"></polyline>
         </svg>`;

  passwordStrengthText.innerHTML = `${icon}<span style="color: ${color}">${label}</span>`;
}

// ========== Real-time Validation ==========

function setupRealtimeValidation() {
  const inputs = [passwordInput, confirmPasswordInput];

  inputs.forEach((input) => {
    // Validate on blur
    input.addEventListener('blur', () => {
      const fieldName = input.name;
      const value = input.value;

      const formData = {
        password: passwordInput.value,
        confirmPassword: confirmPasswordInput.value,
      };

      const validation = validateField(fieldName, value, formData);
      if (!validation.valid && value.trim() !== '') {
        showFieldError(input, validation.message);
      } else if (validation.valid && value.trim() !== '') {
        showFieldSuccess(input);
      }
    });

    // Clear validation on focus
    input.addEventListener('focus', () => {
      clearFieldValidation(input);
    });

    // Validate on input (with debounce)
    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (input.value.trim() !== '') {
          const formData = {
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value,
          };

          const validation = validateField(input.name, input.value, formData);
          if (!validation.valid) {
            showFieldError(input, validation.message);
          } else {
            showFieldSuccess(input);
          }
        } else {
          clearFieldValidation(input);
        }
      }, 500);
    });
  });

  // Password strength update
  passwordInput.addEventListener('input', updatePasswordStrength);
}

// ========== Form Submission ==========

async function handleChangePassword(event) {
  event.preventDefault();

  // Get form data
  const formData = {
    password: passwordInput.value,
    confirmPassword: confirmPasswordInput.value,
  };

  // Validate form
  const validation = validateNewPasswordForm(formData);

  if (!validation.valid) {
    // Show validation errors
    Object.keys(validation.errors).forEach((fieldName) => {
      const input = document.getElementsByName(fieldName)[0];
      if (input) {
        showFieldError(input, validation.errors[fieldName]);
      }
    });
    showAlert(alertContainer, 'error', 'Please fix the errors in the form');
    return;
  }

  // Show loading state
  changePasswordBtn.disabled = true;
  changePasswordBtn.innerHTML = `
    <span class="auth-loading">
      <span class="auth-spinner"></span>
      Changing password...
    </span>
  `;

  try {
    const resetToken = sessionStorage.getItem('resetToken');
    const email = sessionStorage.getItem('resetEmail');

    // ========== API INTEGRATION POINT ==========
    // Replace this with your actual API call
    const response = await mockChangePasswordAPI({
      email,
      resetToken,
      newPassword: formData.password,
    });

    if (response.success) {
      // Clear session storage
      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('resetEmail');

      // Show success
      showAlert(
        alertContainer,
        'success',
        'Password changed successfully! Redirecting to login...'
      );

      // Redirect to login page
      setTimeout(() => {
        window.location.href = '../login/';
      }, 2000);
    } else {
      throw new Error(response.message || 'Failed to change password');
    }
  } catch (error) {
    console.error('Change password error:', error);
    showAlert(
      alertContainer,
      'error',
      error.message || 'Failed to change password. Please try again.'
    );

    // Reset button
    changePasswordBtn.disabled = false;
    changePasswordBtn.innerHTML = '<span class="btn-text">Change Password</span>';
  }
}

// ========== Mock API (Replace with real API) ==========

async function mockChangePasswordAPI({ email, resetToken, newPassword }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock validation - check if token is valid
  if (!resetToken || !resetToken.startsWith('mock-reset-token')) {
    return {
      success: false,
      message: 'Invalid or expired reset token',
    };
  }

  // Success response
  console.log('Password changed for:', email);
  console.log('New password:', newPassword);

  return {
    success: true,
    message: 'Password changed successfully',
  };
}

// ========== Initialize ==========

function init() {
  if (!verifyResetToken()) {
    return;
  }

  setupPasswordToggle();
  setupRealtimeValidation();
  newPasswordForm.addEventListener('submit', handleChangePassword);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
