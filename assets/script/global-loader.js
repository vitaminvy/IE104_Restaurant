/* ========================================
 * GLOBAL LOADING SYSTEM
 * Provides consistent loading UI across all pages
 * ======================================== */

(function() {
  'use strict';

  /* ========================================
   * LOADING STYLES INJECTION
   * ======================================== */
  function injectLoaderStyles() {
    // Check if styles already exist
    if (document.getElementById('global-loader-styles')) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'global-loader-styles';
    styleSheet.textContent = `
      /* ========================================
       * GLOBAL LOADER OVERLAY
       * ======================================== */
      .global-loader-overlay {
        /* Position */
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;

        /* Box model */
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 20px;

        /* Background */
        background: rgba(18, 18, 18, 0.95);
        backdrop-filter: blur(10px);

        /* Transition */
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }

      .global-loader-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      /* ========================================
       * LOADER SPINNER
       * ======================================== */
      .global-loader-spinner {
        /* Box model */
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--color-dark-orange, #fb8f2c);
        border-radius: 50%;

        /* Animation */
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ========================================
       * LOADER TEXT
       * ======================================== */
      .global-loader-text {
        /* Typography */
        color: rgba(255, 255, 255, 0.9);
        font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 0.5px;

        /* Animation */
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      /* ========================================
       * LOADER PROGRESS BAR
       * ======================================== */
      .global-loader-progress {
        /* Position */
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;

        /* Box model */
        height: 3px;

        /* Background */
        background: rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }

      .global-loader-progress-bar {
        /* Box model */
        height: 100%;
        width: 0%;

        /* Background */
        background: linear-gradient(
          90deg,
          var(--color-dark-orange, #fb8f2c),
          #ff6b35
        );

        /* Animation */
        transition: width 0.3s ease;
      }

      /* ========================================
       * CONTENT LOADING STATE
       * ======================================== */
      .content-loading {
        /* Visual */
        opacity: 0.5;
        pointer-events: none;
        filter: blur(2px);

        /* Transition */
        transition: opacity 0.3s ease, filter 0.3s ease;
      }

      .content-loaded {
        /* Visual */
        opacity: 1;
        pointer-events: auto;
        filter: blur(0);

        /* Transition */
        transition: opacity 0.3s ease, filter 0.3s ease;
      }

      /* ========================================
       * SKELETON LOADER (Optional)
       * ======================================== */
      .skeleton {
        /* Background */
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(255, 255, 255, 0.1) 50%,
          rgba(255, 255, 255, 0.05) 100%
        );
        background-size: 200% 100%;

        /* Animation */
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }

      /* ========================================
       * RESPONSIVE
       * ======================================== */
      @media (max-width: 768px) {
        .global-loader-spinner {
          width: 50px;
          height: 50px;
        }

        .global-loader-text {
          font-size: 14px;
        }
      }
    `;

    document.head.appendChild(styleSheet);
  }

  /* ========================================
   * CREATE LOADER ELEMENT
   * ======================================== */
  function createLoaderElement() {
    // Check if loader already exists
    if (document.getElementById('global-loader')) return;

    const loaderOverlay = document.createElement('div');
    loaderOverlay.id = 'global-loader';
    loaderOverlay.className = 'global-loader-overlay';
    loaderOverlay.innerHTML = `
      <div class="global-loader-spinner"></div>
      <div class="global-loader-text">Loading...</div>
      <div class="global-loader-progress">
        <div class="global-loader-progress-bar"></div>
      </div>
    `;

    document.body.appendChild(loaderOverlay);
  }

  /* ========================================
   * SHOW LOADER
   * ======================================== */
  function showLoader(message = 'Loading...') {
    const loader = document.getElementById('global-loader');
    if (!loader) return;

    const textElement = loader.querySelector('.global-loader-text');
    if (textElement && message) {
      textElement.textContent = message;
    }

    // Reset progress bar
    const progressBar = loader.querySelector('.global-loader-progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
    }

    // Show loader
    loader.classList.add('active');

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) {
        progress = 90;
        clearInterval(interval);
      }
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    }, 200);

    // Store interval ID for cleanup
    loader.dataset.intervalId = interval;
  }

  /* ========================================
   * HIDE LOADER
   * ======================================== */
  function hideLoader(delay = 300) {
    const loader = document.getElementById('global-loader');
    if (!loader) return;

    // Complete progress bar
    const progressBar = loader.querySelector('.global-loader-progress-bar');
    if (progressBar) {
      progressBar.style.width = '100%';
    }

    // Clear interval if exists
    const intervalId = loader.dataset.intervalId;
    if (intervalId) {
      clearInterval(parseInt(intervalId));
      delete loader.dataset.intervalId;
    }

    // Hide loader after delay
    setTimeout(() => {
      loader.classList.remove('active');
    }, delay);
  }

  /* ========================================
   * UPDATE LOADER MESSAGE
   * ======================================== */
  function updateLoaderMessage(message) {
    const loader = document.getElementById('global-loader');
    if (!loader) return;

    const textElement = loader.querySelector('.global-loader-text');
    if (textElement) {
      textElement.textContent = message;
    }
  }

  /* ========================================
   * SET CONTENT LOADING STATE
   * ======================================== */
  function setContentLoading(selector, loading = true) {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;

    if (!element) return;

    if (loading) {
      element.classList.add('content-loading');
      element.classList.remove('content-loaded');
    } else {
      element.classList.remove('content-loading');
      element.classList.add('content-loaded');
    }
  }

  /* ========================================
   * INITIALIZE LOADER
   * ======================================== */
  function initLoader() {
    injectLoaderStyles();
    createLoaderElement();
  }

  /* ========================================
   * AUTO-INITIALIZE
   * ======================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }

  /* ========================================
   * PUBLIC API
   * ======================================== */
  window.GlobalLoader = {
    show: showLoader,
    hide: hideLoader,
    updateMessage: updateLoaderMessage,
    setContentLoading: setContentLoading,
    init: initLoader
  };

  console.log('🔄 Global Loader initialized');

})();
