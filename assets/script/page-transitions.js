// ================================
// PAGE TRANSITION SYSTEM
// Consistent loading animations for all page navigations
// ================================

(function () {
  'use strict';

  // ================================
  // CONFIGURATION
  // ================================

  const config = {
    enableTransitions: true,
    transitionDuration: 300, // ms
    minLoadingTime: 500, // Minimum time to show loader
    excludePatterns: [
      /^#/, // Hash links (same page)
      /^mailto:/, // Email links
      /^tel:/, // Phone links
      /^javascript:/, // JavaScript links
      /\.(pdf|zip|jpg|png|gif|svg|mp4|mp3)$/i, // File downloads
    ],
    excludeSelectors: [
      '.no-transition',
      '[target="_blank"]',
      '[download]',
    ],
  };

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  /**
   * Check if URL is internal
   */
  function isInternalLink(url) {
    try {
      const link = new URL(url, window.location.origin);
      return link.origin === window.location.origin;
    } catch {
      // Relative URLs
      return !url.startsWith('http') && !url.startsWith('//');
    }
  }

  /**
   * Check if link should be excluded from transitions
   */
  function shouldExclude(link, href) {
    // Check exclude patterns
    for (const pattern of config.excludePatterns) {
      if (pattern.test(href)) return true;
    }

    // Check exclude selectors
    for (const selector of config.excludeSelectors) {
      if (link.matches(selector)) return true;
    }

    return false;
  }

  /**
   * Get transition message based on URL
   */
  function getTransitionMessage(href) {
    // Analyze the URL to provide context-specific messages
    if (href.includes('cart')) return 'Loading cart...';
    if (href.includes('menu')) return 'Loading menu...';
    if (href.includes('checkout')) return 'Loading checkout...';
    if (href.includes('contact')) return 'Loading contact...';
    if (href.includes('blog')) return 'Loading blog...';
    if (href.includes('about')) return 'Loading about...';
    if (href.includes('product')) return 'Loading product...';
    if (href.includes('index') || href === '/' || href.endsWith('/homepage/')) return 'Loading home...';

    return 'Loading...';
  }

  // ================================
  // HANDLE LINK CLICKS
  // ================================

  function handleLinkClick(event) {
    if (!config.enableTransitions) return;

    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Check if link should be excluded
    if (shouldExclude(link, href)) return;

    // Check if it's an internal link
    if (!isInternalLink(href)) return;

    // Prevent default navigation
    event.preventDefault();

    // Show loader with context-specific message
    if (window.GlobalLoader) {
      const message = getTransitionMessage(href);
      window.GlobalLoader.show(message);
    }

    // Add fade-out effect to current page
    document.body.style.transition = `opacity ${config.transitionDuration}ms ease-out`;
    document.body.style.opacity = '0';

    // Ensure minimum loading time for smooth UX
    const startTime = Date.now();

    setTimeout(() => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, config.minLoadingTime - elapsed);

      setTimeout(() => {
        // Navigate to new page
        window.location.href = href;
      }, remainingTime);
    }, config.transitionDuration);
  }

  // ================================
  // HANDLE PAGE LOAD
  // ================================

  function handlePageLoad() {
    // Hide loader if it's visible
    if (window.GlobalLoader) {
      window.GlobalLoader.hide(200);
    }

    // Fade in the page content
    document.body.style.opacity = '0';
    document.body.style.transition = `opacity ${config.transitionDuration}ms ease-in`;

    // Force reflow
    document.body.offsetHeight;

    // Fade in
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });

    // Clean up transition after it completes
    setTimeout(() => {
      document.body.style.transition = '';
    }, config.transitionDuration);
  }

  // ================================
  // SETUP EVENT LISTENERS
  // ================================

  function setupEventListeners() {
    // Handle link clicks
    document.addEventListener('click', handleLinkClick);

    // Handle page load
    handlePageLoad();

    // Handle browser back/forward buttons
    window.addEventListener('pageshow', (event) => {
      // If page is loaded from cache (back/forward), ensure it's visible
      // Always handle page load on pageshow to ensure visibility, especially on back/forward
      handlePageLoad();
    });
  }

  // ================================
  // PUBLIC API
  // ================================

  window.PageTransitions = {
    enable: () => {
      config.enableTransitions = true;
    },
    disable: () => {
      config.enableTransitions = false;
    },
    isEnabled: () => config.enableTransitions,
    navigate: (href, message) => {
      if (window.GlobalLoader) {
        window.GlobalLoader.show(message || getTransitionMessage(href));
      }

      document.body.style.transition = `opacity ${config.transitionDuration}ms ease-out`;
      document.body.style.opacity = '0';

      setTimeout(() => {
        window.location.href = href;
      }, config.transitionDuration);
    },
  };

  // ================================
  // INITIALIZATION
  // ================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
  } else {
    setupEventListeners();
  }

  // console.log('Page transitions initialized');
})();
