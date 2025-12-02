/**
 * Forgot Password Page Logic
 * Matches restaurant app design system
 */

import {
  validateForgotPasswordForm,
  validateField,
  showFieldError,
  showFieldSuccess,
  clearFieldValidation,
  showAlert,
} from '../auth-validation.js';
import i18nService from '../../assets/script/i18n-service.js';

// ========== DOM Elements ==========

const forgotPasswordForm = document.getElementById('forgot-password-form');
const emailInput = document.getElementById('email');
const sendOTPBtn = document.getElementById('send-otp-btn');
const alertContainer = document.getElementById('alert-container');

// ========== Real-time Validation ==========

function setupRealtimeValidation() {
  // Validate on blur
  emailInput.addEventListener('blur', () => {
    const value = emailInput.value;
    const validation = validateField('email', value);

    if (!validation.valid && value.trim() !== '') {
      showFieldError(emailInput, validation.message);
    } else if (validation.valid && value.trim() !== '') {
      showFieldSuccess(emailInput);
    }
  });

  // Clear validation on focus
  emailInput.addEventListener('focus', () => {
    clearFieldValidation(emailInput);
  });

  // Validate on input (with debounce)
  let timeout;
  emailInput.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (emailInput.value.trim() !== '') {
        const validation = validateField('email', emailInput.value);
        if (!validation.valid) {
          showFieldError(emailInput, validation.message);
        } else {
          showFieldSuccess(emailInput);
        }
      } else {
        clearFieldValidation(emailInput);
      }
    }, 500);
  });
}

// ========== Form Submission ==========

async function handleForgotPassword(event) {
  event.preventDefault();

  // Get form data
  const formData = {
    email: emailInput.value.trim(),
  };

  // Validate form
  const validation = validateForgotPasswordForm(formData);

  if (!validation.valid) {
    // Show validation errors
    Object.keys(validation.errors).forEach((fieldName) => {
      const input = document.getElementsByName(fieldName)[0];
      if (input) {
        showFieldError(input, validation.errors[fieldName]);
      }
    });
    showAlert(alertContainer, 'error', i18nService.t('auth.errors.email_invalid'));
    return;
  }

  // Show loading state
  sendOTPBtn.disabled = true;
  sendOTPBtn.innerHTML = `
    <span class="auth-loading">
      <span class="auth-spinner"></span>
      Sending code...
    </span>
  `;

  try {
    // ========== API INTEGRATION POINT ==========
    // Replace this with your actual API call
    const response = await mockSendOTPAPI(formData);

    if (response.success) {
      // Store email for OTP verification
      sessionStorage.setItem('resetEmail', formData.email);

      // Show success
      showAlert(
        alertContainer,
        'success',
        i18nService.t('auth.messages.forgot_success')
      );

      // Redirect to OTP page
      setTimeout(() => {
        window.location.href = '../otp-verification/';
      }, 1500);
    } else {
      throw new Error(response.message || 'Failed to send verification code');
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    showAlert(
      alertContainer,
      'error',
      error.message || i18nService.t('auth.messages.forgot_failed')
    );

    // Reset button
    sendOTPBtn.disabled = false;
    sendOTPBtn.innerHTML = '<span class="btn-text">Send Verification Code</span>';
  }
}

// ========== Mock API (Replace with real API) ==========

async function mockSendOTPAPI(formData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock validation - check if email exists
  const registeredEmails = [
    'user@restaurant.com',
    'test@example.com',
    'existing@restaurant.com',
  ];

  if (registeredEmails.includes(formData.email)) {
    // Simulate sending OTP (in real app, this would send email/SMS)
    console.log('OTP sent to:', formData.email);
    console.log('Mock OTP:', '123456'); // In production, this would be sent via email/SMS

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  } else {
    return {
      success: false,
      message:
        'Email not found. Please check your email or create a new account.',
    };
  }
}

// ========== Auto-fill from previous page ==========

function checkPreviousData() {
  // Check if coming from login page with email
  const savedEmail = localStorage.getItem('userEmail');
  if (savedEmail) {
    emailInput.value = savedEmail;
  }
}

// ========== Initialize ==========

function init() {
  setupRealtimeValidation();
  checkPreviousData();
  forgotPasswordForm.addEventListener('submit', handleForgotPassword);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
