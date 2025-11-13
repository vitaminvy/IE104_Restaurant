/* ========================================
 * GLOBAL FEATURES INTEGRATION
 * Automatically loads Allergy Alert and Social Proof on all pages
 * ======================================== */

(function() {
  'use strict';

  /* ========================================
   * FEATURE LOADER
   * ======================================== */

  /**
   * Dynamically load a script
   * @param {string} src - Script source path
   * @returns {Promise} Promise that resolves when script loads
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Dynamically load a stylesheet
   * @param {string} href - Stylesheet path
   * @returns {Promise} Promise that resolves when stylesheet loads
   */
  function loadStylesheet(href) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
      document.head.appendChild(link);
    });
  }

  /* ========================================
   * DETERMINE BASE PATH
   * ======================================== */

  function getBasePath() {
    const path = window.location.pathname;
    
    // Determine how many levels deep we are
    if (path.includes('/product-detail-page/')) return '../assets/features/';
    if (path.includes('/menupage/')) return '../assets/features/';
    if (path.includes('/cartpage/')) return '../assets/features/';
    if (path.includes('/checkout-page/')) return '../assets/features/';
    if (path.includes('/homepage/')) return '../assets/features/';
    if (path.includes('/aboutpage/')) return '../assets/features/';
    if (path.includes('/blogpage/')) return '../assets/features/';
    if (path.includes('/blogpage-details/')) return '../assets/features/';
    if (path.includes('/contact-us-1/')) return '../assets/features/';
    if (path.includes('/coming-soon-page/')) return '../assets/features/';
    
    // Default (root level)
    return './assets/features/';
  }

  /* ========================================
   * LOAD FEATURES
   * ======================================== */

  async function loadFeatures() {
    const basePath = getBasePath();

    try {
      // Load stylesheets first (parallel)
      await Promise.all([
        loadStylesheet(`${basePath}allergy-alert.css`),
        loadStylesheet(`${basePath}social-proof.css`)
      ]);

      console.log('✅ Feature stylesheets loaded');

      // Load scripts (parallel)
      await Promise.all([
        loadScript(`${basePath}allergy-alert.js`),
        loadScript(`${basePath}social-proof.js`)
      ]);

      console.log('✅ Feature scripts loaded');
      console.log('🎉 All global features initialized');

    } catch (error) {
      console.error('❌ Error loading features:', error);
    }
  }

  /* ========================================
   * INITIALIZE
   * ======================================== */

  // Load features when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFeatures);
  } else {
    loadFeatures();
  }

})();
