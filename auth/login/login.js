/**
 * Login Page Logic
 * Matches restaurant app design system
 */

import {
  validateLoginForm,
  validateField,
  showFieldError,
  showFieldSuccess,
  clearFieldValidation,
  showAlert,
} from '../auth-validation.js';
import i18nService from '../../assets/script/i18n-service.js';

// ========== DOM Elements ==========

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const alertContainer = document.getElementById('alert-container');
const googleLoginBtn = document.getElementById('google-login');
const facebookLoginBtn = document.getElementById('facebook-login');

// ========== Helpers ==========

function getReturnUrl() {
  // 1. Check query parameter first (highest priority)
  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');
  if (redirectParam) {
    return redirectParam;
  }

  // 2. Check session storage (legacy support)
  const stored = sessionStorage.getItem('loginReturnUrl');
  if (stored) {
    try {
      const url = new URL(stored, window.location.origin);
      const isSameOrigin = url.origin === window.location.origin;
      const isLoginPage = url.pathname.includes('/auth/login');

      if (isSameOrigin && !isLoginPage) {
        sessionStorage.removeItem('loginReturnUrl');
        return url.href;
      }
    } catch (error) {
      console.warn('Invalid return URL, falling back to home:', error);
    }
  }

  // 3. Check referrer (lowest priority)
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

// ========== Real-time Validation ==========

function setupRealtimeValidation() {
  const inputs = [emailInput, passwordInput];

  inputs.forEach((input) => {
    // Validate on blur
    input.addEventListener('blur', () => {
      const fieldName = input.name;
      const value = input.value;

      const validation = validateField(fieldName, value);
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
          const validation = validateField(input.name, input.value);
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
}

// ========== Form Submission ==========

async function handleLogin(event) {
  event.preventDefault();

  // Get form data
  const formData = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
    rememberMe: document.getElementById('remember-me').checked,
  };

  // Basic non-empty check only
  if (!formData.email || !formData.password) {
    showAlert(alertContainer, 'error', i18nService.t('auth.messages.login_missing_fields'));
    return;
  }

  // Show loading state
  loginBtn.disabled = true;
  loginBtn.innerHTML = `
    <span class="auth-loading">
      <span class="auth-spinner"></span>
      Logging in...
    </span>
  `;

  // Accept any credentials and redirect back
  if (formData.rememberMe) {
    localStorage.setItem('authToken', 'mock-token-' + Date.now());
    localStorage.setItem('userEmail', formData.email);
  } else {
    sessionStorage.setItem('authToken', 'mock-token-' + Date.now());
  }
  localStorage.setItem(
    'userData',
    JSON.stringify({ id: Date.now(), name: 'Guest User', email: formData.email })
  );

  showAlert(alertContainer, 'success', i18nService.t('auth.messages.login_success'));

  setTimeout(() => {
    window.location.href = getReturnUrl();
  }, 800);
}

// ========== Mock API (Replace with real API) ==========

async function mockLoginAPI(formData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock validation
  const validEmails = ['user@restaurant.com', 'test@example.com'];
  const validPassword = 'Password123';

  if (
    validEmails.includes(formData.email) &&
    formData.password === validPassword
  ) {
    return {
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        name: 'Guest User',
        email: formData.email,
        avatar: null,
      },
    };
  } else {
    return {
      success: false,
      message: 'Invalid email or password',
    };
  }
}

// ========== Social Login ==========

function setupSocialLogin() {
  googleLoginBtn.addEventListener('click', async () => {
    try {
      googleLoginBtn.disabled = true;
      googleLoginBtn.innerHTML = `
        <span class="auth-loading">
          <span class="auth-spinner"></span>
          Connecting...
        </span>
      `;

      // ========== GOOGLE LOGIN INTEGRATION POINT ==========
      // Integrate with Google OAuth here
      // Example: await signInWithGoogle();

      showAlert(alertContainer, 'error', i18nService.t('auth.messages.google_not_configured'));

      googleLoginBtn.disabled = false;
      googleLoginBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      `;
    } catch (error) {
      console.error('Google login error:', error);
      showAlert(alertContainer, 'error', i18nService.t('auth.messages.google_failed'));
      googleLoginBtn.disabled = false;
    }
  });

  facebookLoginBtn.addEventListener('click', async () => {
    try {
      facebookLoginBtn.disabled = true;
      facebookLoginBtn.innerHTML = `
        <span class="auth-loading">
          <span class="auth-spinner"></span>
          Connecting...
        </span>
      `;

      // ========== FACEBOOK LOGIN INTEGRATION POINT ==========
      // Integrate with Facebook OAuth here
      // Example: await signInWithFacebook();

      showAlert(alertContainer, 'error', i18nService.t('auth.messages.facebook_not_configured'));

      facebookLoginBtn.disabled = false;
      facebookLoginBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      `;
    } catch (error) {
      console.error('Facebook login error:', error);
      showAlert(alertContainer, 'error', i18nService.t('auth.messages.facebook_failed'));
      facebookLoginBtn.disabled = false;
    }
  });
}

// ========== Check Existing Session ==========

function checkExistingSession() {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  if (token) {
    // User is already logged in
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      emailInput.value = savedEmail;
      document.getElementById('remember-me').checked = true;
    }
  }
}

// ========== Redirect Parameter Handling ==========

function setupRedirectParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');

  if (redirect) {
    // Preserve redirect param in the "Create Account" link
    const registerLink = document.querySelector('.auth-footer-text a');
    if (registerLink) {
      registerLink.href = `../register/?redirect=${encodeURIComponent(redirect)}`;
    }
    
    // Preserve redirect param in the "Forgot Password" link
    const forgotLink = document.querySelector('.auth-forgot-password a');
    if (forgotLink) {
      forgotLink.href = `../forgot-password/?redirect=${encodeURIComponent(redirect)}`;
    }
  }
}

// ========== Initialize ==========

function init() {
  setupPasswordToggle();
  setupRealtimeValidation();
  setupSocialLogin();
  checkExistingSession();
  setupRedirectParams(); // Add this
  loginForm.addEventListener('submit', handleLogin);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
