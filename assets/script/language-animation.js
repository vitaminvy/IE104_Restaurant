/**
 * Language Animation Module
 *
 * Provides smooth, professional text transitions for language switching
 * that prevent layout shifts, jitter, and flickering.
 *
 * Key Features:
 * - Fade + transform animations for elegant transitions
 * - Layout stability: prevents container resizing during animation
 * - Staggered animations for visual polish
 * - Performance-optimized using RAF and batch DOM operations
 * - Graceful fallback for browsers without animation support
 */

const LanguageAnimation = (() => {
  // Configuration
  const CONFIG = {
    animationDuration: 250,      // Duration of fade-out/fade-in (ms)
    staggerDelay: 30,            // Delay between each nav item animation (ms)
    transformDistance: 8,        // Distance for slide effect (px)
    useStagger: true,            // Enable staggered animations
    preCalculateWidth: false     // DISABLED: Don't manipulate dimensions to avoid UI changes
  };

  // Cache for element measurements to prevent layout thrashing
  const measurementCache = new WeakMap();

  /**
   * Measures and caches element dimensions before animation
   * This prevents layout shifts during text changes
   */
  function preserveElementDimensions(element) {
    if (!CONFIG.preCalculateWidth) return;

    // Check if we've already preserved dimensions for this element (avoid double-setting)
    if (measurementCache.has(element)) {
      return;
    }

    // Get current computed dimensions BEFORE any inline styles are applied
    const computedStyle = window.getComputedStyle(element);
    const currentWidth = element.offsetWidth;
    const currentHeight = element.offsetHeight;

    // Store ORIGINAL inline styles (if any) so we can restore them later
    const originalInlineMinWidth = element.style.minWidth;
    const originalInlineMinHeight = element.style.minHeight;

    // Cache measurements including original inline styles
    measurementCache.set(element, {
      width: currentWidth,
      height: currentHeight,
      originalInlineMinWidth: originalInlineMinWidth,
      originalInlineMinHeight: originalInlineMinHeight,
      computedMinWidth: computedStyle.minWidth,
      computedMinHeight: computedStyle.minHeight
    });

    // Apply fixed dimensions temporarily to prevent layout shift
    // Only set if the element has actual dimensions
    if (currentWidth > 0) {
      element.style.minWidth = `${currentWidth}px`;
    }
    if (currentHeight > 0) {
      element.style.minHeight = `${currentHeight}px`;
    }
  }

  /**
   * Restores element to natural dimensions after animation
   * COMPLETELY removes inline dimension styles to prevent accumulation
   */
  function restoreElementDimensions(element, delay = 0) {
    if (!CONFIG.preCalculateWidth) return;

    setTimeout(() => {
      const cached = measurementCache.get(element);

      if (cached) {
        // Restore original inline styles (or remove if there were none)
        element.style.minWidth = cached.originalInlineMinWidth;
        element.style.minHeight = cached.originalInlineMinHeight;

        // Clear from cache to allow fresh measurement next time
        measurementCache.delete(element);
      } else {
        // Fallback: just remove inline styles entirely
        element.style.minWidth = '';
        element.style.minHeight = '';
      }
    }, delay);
  }

  /**
   * Animates a single element's text change with fade + slide effect
   * IMPORTANT: This function is completely self-contained and cleans up all
   * inline styles to ensure no UI changes persist after animation
   *
   * @param {HTMLElement} element - The element whose text will change
   * @param {string} newText - The new text content
   * @param {number} delay - Delay before starting animation (for stagger effect)
   * @returns {Promise} - Resolves when animation completes
   */
  function animateTextChange(element, newText, delay = 0) {
    return new Promise((resolve) => {
      // If new text is same as current, skip animation
      if (element.textContent.trim() === newText.trim()) {
        resolve();
        return;
      }

      // Store original inline styles to restore them exactly
      const originalStyles = {
        transition: element.style.transition,
        opacity: element.style.opacity,
        transform: element.style.transform
      };

      // Preserve current dimensions ONLY if enabled (disabled by default to avoid UI changes)
      preserveElementDimensions(element);

      // Apply delay for stagger effect
      setTimeout(() => {
        // Phase 1: Fade out and slide up
        element.style.transition = `opacity ${CONFIG.animationDuration}ms ease, transform ${CONFIG.animationDuration}ms ease`;
        element.style.opacity = '0';
        element.style.transform = `translateY(-${CONFIG.transformDistance}px)`;

        // Phase 2: Change text and fade in
        setTimeout(() => {
          // Update text content (batched DOM write)
          element.textContent = newText;

          // Force reflow to ensure transform is applied
          void element.offsetHeight;

          // Reset transform position for slide-in from below
          element.style.transform = `translateY(${CONFIG.transformDistance}px)`;

          // Use RAF for smooth animation start
          requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';

            // Phase 3: Complete cleanup after animation
            setTimeout(() => {
              // CRITICAL: Restore exact original inline styles (or remove if none existed)
              element.style.transition = originalStyles.transition;
              element.style.opacity = originalStyles.opacity;
              element.style.transform = originalStyles.transform;

              // Restore natural dimensions
              restoreElementDimensions(element, 50);

              resolve();
            }, CONFIG.animationDuration);
          });
        }, CONFIG.animationDuration);
      }, delay);
    });
  }

  /**
   * Animates multiple elements with optional stagger effect
   *
   * @param {NodeList|Array} elements - Elements to animate
   * @param {Function} getNewText - Function that returns new text for each element
   * @returns {Promise} - Resolves when all animations complete
   */
  async function animateElements(elements, getNewText) {
    // Clear any stale cache entries first to prevent dimension accumulation
    elements.forEach(element => {
      if (measurementCache.has(element)) {
        measurementCache.delete(element);
      }
    });

    // Batch all dimension measurements first (read phase)
    elements.forEach(element => preserveElementDimensions(element));

    // Create animation promises with stagger delays
    const animationPromises = Array.from(elements).map((element, index) => {
      const newText = getNewText(element);
      const delay = CONFIG.useStagger ? index * CONFIG.staggerDelay : 0;
      return animateTextChange(element, newText, delay);
    });

    // Wait for all animations to complete
    return Promise.all(animationPromises);
  }

  /**
   * Main function to animate translation changes
   * Automatically finds and animates all [data-i18n] elements
   *
   * @param {Function} getTranslation - Function that takes a key and returns translated text
   * @returns {Promise} - Resolves when all animations complete
   */
  async function animateTranslations(getTranslation) {
    // Find all elements with translation keys
    const elements = document.querySelectorAll('[data-i18n]');

    if (elements.length === 0) {
      return Promise.resolve();
    }

    // Animate all elements with their new translations
    return animateElements(elements, (element) => {
      const key = element.getAttribute('data-i18n');
      return getTranslation(key) || element.textContent;
    });
  }

  /**
   * Fallback function for browsers without animation support
   * Directly updates text without animations
   */
  function updateTranslationsImmediate(getTranslation) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = getTranslation(key);
      if (translation !== undefined) {
        element.textContent = translation;
      }
    });
  }

  /**
   * Updates configuration options
   *
   * @param {Object} options - Configuration options to update
   */
  function configure(options) {
    Object.assign(CONFIG, options);
  }

  /**
   * Check if browser supports smooth animations
   */
  function supportsAnimations() {
    return 'requestAnimationFrame' in window && 'Promise' in window;
  }

  // Public API
  return {
    animateTextChange,
    animateElements,
    animateTranslations,
    updateTranslationsImmediate,
    configure,
    supportsAnimations,
    get config() {
      return { ...CONFIG };
    }
  };
})();

// Export for use in other modules
export default LanguageAnimation;

// Also expose globally for non-module scripts
if (typeof window !== 'undefined') {
  window.LanguageAnimation = LanguageAnimation;
}
