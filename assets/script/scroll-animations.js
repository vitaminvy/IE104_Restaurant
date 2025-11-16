// ================================
// SCROLL-TRIGGERED ANIMATIONS
// Intersection Observer for performance
// ================================

(function () {
  'use strict';

  // ----- CONFIGURATION -----

  const config = {
    threshold: 0.1, // Trigger when 10% visible
    rootMargin: '0px 0px -50px 0px', // Trigger slightly before element enters viewport
    animateOnce: true, // Animate only once (not on every scroll)
  };

  // ----- STATE -----

  let observer = null;
  const animatedElements = new Set();

  // ================================
  // CORE FUNCTIONS
  // ================================

  /**
   * Initialize the scroll animation system
   */
  function init() {
    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, animations disabled');
      fallbackShowAll();
      return;
    }

    // Create observer
    observer = new IntersectionObserver(handleIntersection, {
      threshold: config.threshold,
      rootMargin: config.rootMargin,
    });

    // Observe all elements with animation classes
    observeElements();

    // Re-observe on dynamic content changes
    setupMutationObserver();
  }

  /**
   * Find and observe all elements that should animate
   */
  function observeElements() {
    const selectors = [
      '.animate-on-scroll',
      '.animate-fade',
      '.animate-slide-up',
      '.animate-slide-down',
      '.animate-slide-left',
      '.animate-slide-right',
      '.animate-scale',
      '.animate-rotate',
    ];

    const elements = document.querySelectorAll(selectors.join(', '));

    elements.forEach((element) => {
      if (!animatedElements.has(element)) {
        observer.observe(element);
      }
    });
  }

  /**
   * Handle intersection events
   * @param {IntersectionObserverEntry[]} entries
   */
  function handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateElement(entry.target);

        // Stop observing if animateOnce is true
        if (config.animateOnce) {
          observer.unobserve(entry.target);
          animatedElements.add(entry.target);
        }
      } else if (!config.animateOnce) {
        // Remove animation if element leaves viewport (for repeat animations)
        entry.target.classList.remove('animated');
      }
    });
  }

  /**
   * Animate an element by adding the 'animated' class
   * @param {HTMLElement} element
   */
  function animateElement(element) {
    // Add base animated class
    element.classList.add('animated');

    // Handle stagger children if parent has stagger class
    if (element.classList.contains('stagger-children')) {
      staggerChildren(element);
    }

    // Dispatch custom event for hooking
    element.dispatchEvent(
      new CustomEvent('element-animated', {
        bubbles: true,
        detail: { element },
      })
    );
  }

  /**
   * Apply stagger effect to child elements
   * @param {HTMLElement} parent
   */
  function staggerChildren(parent) {
    const children = Array.from(parent.children);

    children.forEach((child, index) => {
      // Add animation class to children if not already present
      if (!child.classList.contains('animate-on-scroll')) {
        child.classList.add('animate-on-scroll');
      }

      // Animate with delay
      setTimeout(() => {
        child.classList.add('animated');
      }, index * 100); // 100ms stagger
    });
  }

  /**
   * Watch for dynamically added content
   */
  function setupMutationObserver() {
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldObserve = false;

      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          shouldObserve = true;
        }
      });

      if (shouldObserve) {
        // Debounce to avoid excessive calls
        clearTimeout(setupMutationObserver.timeout);
        setupMutationObserver.timeout = setTimeout(() => {
          observeElements();
        }, 100);
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Fallback for browsers without IntersectionObserver
   * Shows all elements immediately
   */
  function fallbackShowAll() {
    const selectors = [
      '.animate-on-scroll',
      '.animate-fade',
      '.animate-slide-up',
      '.animate-slide-down',
      '.animate-slide-left',
      '.animate-slide-right',
      '.animate-scale',
      '.animate-rotate',
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    elements.forEach((element) => {
      element.style.opacity = '1';
      element.style.transform = 'none';
    });
  }

  // ================================
  // PUBLIC API
  // ================================

  /**
   * Manually trigger animation on an element
   * @param {HTMLElement|string} elementOrSelector
   */
  function animate(elementOrSelector) {
    const element =
      typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;

    if (element) {
      animateElement(element);
    }
  }

  /**
   * Refresh observer (useful after dynamic content loading)
   */
  function refresh() {
    observeElements();
  }

  /**
   * Reset an element's animation state
   * @param {HTMLElement|string} elementOrSelector
   */
  function reset(elementOrSelector) {
    const element =
      typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;

    if (element) {
      element.classList.remove('animated');
      animatedElements.delete(element);
      if (observer) {
        observer.observe(element);
      }
    }
  }

  /**
   * Update configuration
   * @param {Object} newConfig
   */
  function configure(newConfig) {
    Object.assign(config, newConfig);

    // Reinitialize if observer exists
    if (observer) {
      observer.disconnect();
      init();
    }
  }

  // ================================
  // INITIALIZATION
  // ================================

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ================================
  // GLOBAL API
  // ================================

  window.ScrollAnimations = {
    animate,
    refresh,
    reset,
    configure,
  };
})();
