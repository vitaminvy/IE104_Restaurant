// ================================
// CONSTANTS MODULE
// Centralized constants for storage keys, timings, and configuration
// ================================

/**
 * Storage Keys - Single source of truth for localStorage keys
 */
const STORAGE_KEYS = {
  // Cart & Checkout
  CART: 'restaurantCart',
  COUPON: 'restaurant_applied_coupon',

  // User Preferences
  FAVORITES: 'restaurant_favorites',
  DIETARY_PREFERENCES: 'restaurant_dietary_preferences',
  ALLERGENS: 'userAllergens',
  DARK_MODE: 'restaurant_dark_mode',

  // User Data
  USER_PROFILE: 'restaurant_user_profile',
  ORDER_HISTORY: 'restaurant_order_history',
  LOYALTY_POINTS: 'restaurant_loyalty_points',
  REVIEWS: 'restaurant_user_reviews',

  // Tracking
  RECENTLY_VIEWED: 'restaurant_recently_viewed',
  CURRENT_ORDER: 'restaurant_current_order',
  REFERRAL_CODE: 'restaurant_referral_code',

  // Comparison
  COMPARISON_ITEMS: 'restaurant_comparison_items',
};

/**
 * Timing Constants - Consistent durations across the app
 */
const TIMINGS = {
  // Form submission delays
  FORM_SUBMIT_DELAY: 1500,

  // Notification durations
  NOTIFICATION_SHORT: 3000,
  NOTIFICATION_MEDIUM: 5000,
  NOTIFICATION_LONG: 7000,

  // Debounce/Throttle
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_RESIZE: 250,
  THROTTLE_SCROLL: 100,

  // Animation durations
  ANIMATION_FAST: 300,
  ANIMATION_NORMAL: 500,
  ANIMATION_SLOW: 800,

  // Auto-hide durations
  TOAST_DURATION: 4000,
  LOADER_MIN_DISPLAY: 500,
};

/**
 * Animation Durations - Consistent animation timings
 */
const ANIMATION_DURATIONS = {
  PAGE_TRANSITION: 400,
  MODAL_OPEN: 300,
  MODAL_CLOSE: 200,
  DROPDOWN_OPEN: 250,
  TOOLTIP_SHOW: 150,
};

/**
 * Loyalty Program Configuration
 */
const LOYALTY_CONFIG = {
  POINTS_PER_DOLLAR: 10, // 10 points per $1 spent
  TIERS: {
    BRONZE: { name: 'Bronze', minPoints: 0, discount: 0, color: '#cd7f32' },
    SILVER: { name: 'Silver', minPoints: 500, discount: 5, color: '#c0c0c0' },
    GOLD: { name: 'Gold', minPoints: 1500, discount: 10, color: '#ffd700' },
    PLATINUM: { name: 'Platinum', minPoints: 3000, discount: 15, color: '#e5e4e2' },
  },
  REWARDS: [
    { id: 1, name: 'Free Appetizer', pointsCost: 250 },
    { id: 2, name: 'Free Dessert', pointsCost: 200 },
    { id: 3, name: '$5 Off', pointsCost: 500 },
    { id: 4, name: '$10 Off', pointsCost: 900 },
    { id: 5, name: 'Free Delivery', pointsCost: 150 },
  ],
};

/**
 * UI Configuration
 */
const UI_CONFIG = {
  MAX_FAVORITES: 100,
  MAX_COMPARISON_ITEMS: 4,
  MAX_RECENTLY_VIEWED: 12,
  SEARCH_RESULTS_LIMIT: 50,
  PAGINATION_PER_PAGE: 8,
};

/**
 * Default Values
 */
const DEFAULTS = {
  CURRENCY_SYMBOL: '$',
  SHIPPING_COST: 6.0,
  TAX_RATE: 0.1, // 10%
  DEFAULT_RATING: 4.0,
  DEFAULT_PREP_TIME: 20, // minutes
};

// Export all constants
window.STORAGE_KEYS = STORAGE_KEYS;
window.TIMINGS = TIMINGS;
window.ANIMATION_DURATIONS = ANIMATION_DURATIONS;
window.LOYALTY_CONFIG = LOYALTY_CONFIG;
window.UI_CONFIG = UI_CONFIG;
window.DEFAULTS = DEFAULTS;
