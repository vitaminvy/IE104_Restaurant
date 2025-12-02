/**
 * OTP Verification Page Logic
 * Matches restaurant app design system
 */

import { validateOTP, showAlert } from '../auth-validation.js';
import i18nService from '../../assets/script/i18n-service.js';

// ========== DOM Elements ==========

const otpForm = document.getElementById('otp-form');
const verifyBtn = document.getElementById('verify-btn');
const alertContainer = document.getElementById('alert-container');
const maskedEmailEl = document.getElementById('masked-email');
const resendBtn = document.getElementById('resend-btn');
const resendTimerEl = document.getElementById('resend-timer');

// OTP inputs
const otpInputs = [];
for (let i = 1; i <= 6; i++) {
  otpInputs.push(document.getElementById(`otp-${i}`));
}

// ========== State ==========

let resendTimer = 60;
let resendInterval = null;

// ========== Mask Email ==========

function maskEmail(email) {
  if (!email) return '';

  const [username, domain] = email.split('@');
  if (!username || !domain) return email;

  const visibleChars = Math.min(3, Math.floor(username.length / 2));
  const maskedUsername =
    username.substring(0, visibleChars) + '***' + username.slice(-1);

  return `${maskedUsername}@${domain}`;
}

// ========== Display Email ==========

function displayEmail() {
  const email = sessionStorage.getItem('resetEmail');

  if (!email) {
    // No email found, redirect back
    showAlert(
      alertContainer,
      'error',
      i18nService.t('auth.messages.otp_no_email')
    );
    setTimeout(() => {
      window.location.href = '../forgot-password/';
    }, 2000);
    return;
  }

  maskedEmailEl.textContent = maskEmail(email);
}

// ========== OTP Input Handling ==========

function setupOTPInputs() {
  otpInputs.forEach((input, index) => {
    // Auto-focus next input on entry
    input.addEventListener('input', (e) => {
      const value = e.target.value;

      // Only allow numbers
      if (!/^\d*$/.test(value)) {
        e.target.value = '';
        return;
      }

      // Add filled class for styling
      if (value) {
        input.classList.add('filled');

        // Auto-focus next input
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      } else {
        input.classList.remove('filled');
      }

      // Auto-submit when all filled
      checkAutoSubmit();
    });

    // Handle backspace - focus previous input
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
        otpInputs[index - 1].value = '';
        otpInputs[index - 1].classList.remove('filled');
      }
    });

    // Handle paste - distribute digits across inputs
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').trim();

      // Only accept 6 digits
      if (!/^\d{6}$/.test(pastedData)) {
        showAlert(alertContainer, 'error', 'Please paste a valid 6-digit code');
        return;
      }

      // Fill inputs with pasted digits
      for (let i = 0; i < 6; i++) {
        otpInputs[i].value = pastedData[i];
        otpInputs[i].classList.add('filled');
      }

      // Focus last input
      otpInputs[5].focus();

      // Auto-submit
      setTimeout(checkAutoSubmit, 100);
    });

    // Select all on focus
    input.addEventListener('focus', (e) => {
      e.target.select();
    });
  });

  // Focus first input
  otpInputs[0].focus();
}

// ========== Auto-submit when all filled ==========

function checkAutoSubmit() {
  const allFilled = otpInputs.every((input) => input.value.length === 1);

  if (allFilled) {
    // Small delay for better UX
    setTimeout(() => {
      otpForm.dispatchEvent(new Event('submit'));
    }, 300);
  }
}

// ========== Resend Timer ==========

function startResendTimer() {
  resendTimer = 60;
  resendBtn.disabled = true;
  resendTimerEl.style.display = 'inline';

  resendInterval = setInterval(() => {
    resendTimer--;
    resendTimerEl.textContent = `(${resendTimer}s)`;

    if (resendTimer <= 0) {
      clearInterval(resendInterval);
      resendBtn.disabled = false;
      resendTimerEl.style.display = 'none';
    }
  }, 1000);
}

// ========== Resend OTP ==========

async function handleResendOTP() {
  const email = sessionStorage.getItem('resetEmail');

  if (!email) {
    showAlert(alertContainer, 'error', i18nService.t('auth.messages.otp_session_expired'));
    setTimeout(() => {
      window.location.href = '../forgot-password/';
    }, 2000);
    return;
  }

  try {
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';

    // ========== API INTEGRATION POINT ==========
    const response = await mockResendOTPAPI({ email });

    if (response.success) {
      showAlert(alertContainer, 'success', i18nService.t('auth.messages.otp_resend_success'));

      // Clear inputs
      otpInputs.forEach((input) => {
        input.value = '';
        input.classList.remove('filled');
      });
      otpInputs[0].focus();

      // Restart timer
      startResendTimer();
      resendBtn.textContent = 'Resend';
    } else {
      throw new Error(response.message || 'Failed to resend code');
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    showAlert(alertContainer, 'error', error.message || i18nService.t('auth.messages.otp_resend_failed'));
    resendBtn.disabled = false;
    resendBtn.textContent = 'Resend';
  }
}

// ========== Form Submission ==========

async function handleVerifyOTP(event) {
  event.preventDefault();

  // Get OTP value
  const otp = otpInputs.map((input) => input.value).join('');

  // Validate OTP
  const validation = validateOTP(otp);

  if (!validation.valid) {
    showAlert(alertContainer, 'error', validation.message);
    // Highlight empty inputs
    otpInputs.forEach((input) => {
      if (!input.value) {
        input.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        setTimeout(() => {
          input.style.borderColor = '';
        }, 2000);
      }
    });
    return;
  }

  // Show loading state
  verifyBtn.disabled = true;
  verifyBtn.innerHTML = `
    <span class="auth-loading">
      <span class="auth-spinner"></span>
      Verifying...
    </span>
  `;

  try {
    const email = sessionStorage.getItem('resetEmail');

    // ========== API INTEGRATION POINT ==========
    const response = await mockVerifyOTPAPI({ email, otp });

    if (response.success) {
      // Store reset token for new password page
      sessionStorage.setItem('resetToken', response.resetToken);

      // Show success
      showAlert(alertContainer, 'success', i18nService.t('auth.messages.otp_verified'));

      // Redirect to new password page
      setTimeout(() => {
        window.location.href = '../new-password/';
      }, 1500);
    } else {
      throw new Error(response.message || 'Invalid verification code');
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    showAlert(
      alertContainer,
      'error',
      error.message || i18nService.t('auth.messages.otp_invalid')
    );

    // Clear inputs on error
    otpInputs.forEach((input) => {
      input.value = '';
      input.classList.remove('filled');
    });
    otpInputs[0].focus();

    // Reset button
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = '<span class="btn-text">Verify Code</span>';
  }
}

// ========== Mock APIs (Replace with real API) ==========

async function mockVerifyOTPAPI({ email, otp }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock verification - accept '123456' as valid
  const validOTP = '123456';

  if (otp === validOTP) {
    return {
      success: true,
      resetToken: 'mock-reset-token-' + Date.now(),
    };
  } else {
    return {
      success: false,
      message: 'Invalid verification code. Please try again.',
    };
  }
}

async function mockResendOTPAPI({ email }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('New OTP sent to:', email);
  console.log('Mock OTP:', '123456');

  return {
    success: true,
    message: 'OTP resent successfully',
  };
}

// ========== Initialize ==========

function init() {
  displayEmail();
  setupOTPInputs();
  startResendTimer();

  otpForm.addEventListener('submit', handleVerifyOTP);
  resendBtn.addEventListener('click', handleResendOTP);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
