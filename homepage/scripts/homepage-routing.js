/* ========================================
 * HOMEPAGE ROUTING WITH GLOBAL LOADER
 * Handles all navigation links on homepage
 * ======================================== */

(function() {
  'use strict';

  /* ========================================
   * SETUP NAVIGATION LINKS WITH LOADER
   * ======================================== */
  function setupHomepageNavigation() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
      initNavigation();
    }
  }

  function initNavigation() {
    // Hero section - View More button
    setupLink('.hero__btn', 'Loading Menu...');

    // Discover Menu section links
    setupLink('.discover__link', 'Loading Menu...');

    // Daily Offers link
    setupLink('.daily-offers__promo-link', 'Loading Menu...');

    // Team/Coming Soon link
    setupLink('.team-link', 'Loading Page...');

    // Blog header link
    setupLink('.blogs__header-link', 'Loading Blog...');

    // Blog card read more links
    setupLinks('.blog-card__readmore', 'Loading Article...');

    console.log('✅ Homepage navigation with loaders initialized');
  }

  /* ========================================
   * SETUP SINGLE LINK
   * ======================================== */
  function setupLink(selector, message) {
    const link = document.querySelector(selector);
    if (!link) return;

    const href = link.getAttribute('href');
    
    // Skip if it's a hash link (same page anchor)
    if (!href || href.startsWith('#')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Show global loader
      if (window.GlobalLoader) {
        window.GlobalLoader.show(message);
      }

      // Navigate after brief delay
      setTimeout(() => {
        window.location.href = href;
      }, 200);
    });
  }

  /* ========================================
   * SETUP MULTIPLE LINKS (same class)
   * ======================================== */
  function setupLinks(selector, message) {
    const links = document.querySelectorAll(selector);
    if (!links.length) return;

    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Skip if it's a hash link
      if (!href || href.startsWith('#')) return;

      link.addEventListener('click', (e) => {
        e.preventDefault();

        // Show global loader
        if (window.GlobalLoader) {
          window.GlobalLoader.show(message);
        }

        // Navigate after brief delay
        setTimeout(() => {
          window.location.href = href;
        }, 200);
      });
    });
  }

  /* ========================================
   * INITIALIZE
   * ======================================== */
  setupHomepageNavigation();

  console.log('🏠 Homepage routing system loaded');

})();
