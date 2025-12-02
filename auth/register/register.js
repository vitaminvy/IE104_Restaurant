/**
 * Register Page Logic
 * Matches restaurant app design system
 */

import {
  validateRegisterForm,
  validateField,
  calculatePasswordStrength,
  showFieldError,
  showFieldSuccess,
  clearFieldValidation,
  showAlert,
} from '../auth-validation.js';
import i18nService from '../../assets/script/i18n-service.js';

// ========== DOM Elements ==========

const registerForm = document.getElementById('register-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const termsCheckbox = document.getElementById('terms');
const registerBtn = document.getElementById('register-btn');
const alertContainer = document.getElementById('alert-container');
const googleSignupBtn = document.getElementById('google-signup');
const facebookSignupBtn = document.getElementById('facebook-signup');
const passwordStrengthContainer = document.getElementById('password-strength');
const passwordStrengthFill = document.getElementById('password-strength-fill');
const passwordStrengthText = document.getElementById('password-strength-text');

// ========== Helpers ==========

function getReturnUrl() {
  // 1. Check query parameter first (highest priority)
  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');
  if (redirectParam) {
    return redirectParam;
  }

  // 2. Check referrer (lowest priority)
  const ref = document.referrer;
  if (ref && ref.startsWith(window.location.origin) && !ref.includes('/auth/login') && !ref.includes('/auth/register')) {
    return ref;
  }

  // Default to site home
  return '/';
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
  const inputs = [nameInput, emailInput, passwordInput, confirmPasswordInput];

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

async function handleRegister(event) {
  event.preventDefault();

  // Get form data
  const formData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    confirmPassword: confirmPasswordInput.value,
    terms: termsCheckbox.checked,
  };

  // Check terms acceptance
  if (!formData.terms) {
    showAlert(
      alertContainer,
      'error',
      i18nService.t('auth.messages.accept_terms')
    );
    return;
  }

  // Validate form
  const validation = validateRegisterForm(formData);

  if (!validation.valid) {
    // Show validation errors
    Object.keys(validation.errors).forEach((fieldName) => {
      const input = document.getElementsByName(fieldName)[0];
      if (input) {
        showFieldError(input, validation.errors[fieldName]);
      }
    });
    showAlert(alertContainer, 'error', i18nService.t('auth.messages.fix_errors'));
    return;
  }

  // Show loading state
  registerBtn.disabled = true;
  registerBtn.innerHTML = `
    <span class="auth-loading">
      <span class="auth-spinner"></span>
      Creating account...
    </span>
  `;

  // Simulate registration success
  showAlert(
    alertContainer,
    'success',
    i18nService.t('auth.messages.register_success')
  );

  const returnUrl = getReturnUrl();

  setTimeout(() => {
    window.location.href = `../login/?redirect=${encodeURIComponent(returnUrl)}`;
  }, 900);
}

// ========== Mock API (Replace with real API) ==========

async function mockRegisterAPI(formData) {
  // kept for future real API hook; currently unused
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true };
}

// ========== Social Signup ==========

function setupSocialSignup() {
  googleSignupBtn.addEventListener('click', async () => {
    try {
      googleSignupBtn.disabled = true;
      googleSignupBtn.innerHTML = `
        <span class="auth-loading">
          <span class="auth-spinner"></span>
          Connecting...
        </span>
      `;

      // ========== GOOGLE SIGNUP INTEGRATION POINT ==========
      // Integrate with Google OAuth here

      showAlert(alertContainer, 'error', i18nService.t('auth.messages.google_not_configured'));

      googleSignupBtn.disabled = false;
      googleSignupBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      `;
    } catch (error) {
      console.error('Google signup error:', error);
      showAlert(alertContainer, 'error', i18nService.t('auth.messages.google_failed'));
      googleSignupBtn.disabled = false;
    }
  });

  facebookSignupBtn.addEventListener('click', async () => {
    try {
      facebookSignupBtn.disabled = true;
      facebookSignupBtn.innerHTML = `
        <span class="auth-loading">
          <span class="auth-spinner"></span>
          Connecting...
        </span>
      `;

      // ========== FACEBOOK SIGNUP INTEGRATION POINT ==========
      // Integrate with Facebook OAuth here

      showAlert(alertContainer, 'error', i18nService.t('auth.messages.facebook_not_configured'));

      facebookSignupBtn.disabled = false;
      facebookSignupBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      `;
    } catch (error) {
      console.error('Facebook signup error:', error);
      showAlert(alertContainer, 'error', i18nService.t('auth.messages.facebook_failed'));
      facebookSignupBtn.disabled = false;
    }
  });
}

// ========== Redirect Parameter Handling ==========

function setupRedirectParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');

  if (redirect) {
    // Preserve redirect param in the "Login" link
    const loginLink = document.querySelector('.auth-footer-text a');
    if (loginLink) {
      loginLink.href = `../login/?redirect=${encodeURIComponent(redirect)}`;
    }
  }
}

// ========== Initialize ==========

function init() {
  setupPasswordToggle();
  setupRealtimeValidation();
  setupSocialSignup();
  setupRedirectParams(); // Add this
  registerForm.addEventListener('submit', handleRegister);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
