// ================================
// EVENT BUS UTILITY
// Simple publish-subscribe system for decoupled component communication
// ================================

/**
 * EventBus - Centralized event system
 * Allows components to communicate without tight coupling
 *
 * Usage:
 * - EventBus.on('cart:updated', handler)
 * - EventBus.emit('cart:updated', data)
 * - EventBus.off('cart:updated', handler)
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Event name
   * @param {Function} callback - Handler function
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Event name
   * @param {Function} callback - Handler function to remove
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;

    this.events[eventName] = this.events[eventName].filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Emit an event to all subscribers
   * @param {string} eventName - Event name
   * @param {*} data - Data to pass to handlers
   */
  emit(eventName, data) {
    if (!this.events[eventName]) return;

    this.events[eventName].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for "${eventName}":`, error);
      }
    });
  }

  /**
   * Subscribe to an event once (auto-unsubscribe after first call)
   * @param {string} eventName - Event name
   * @param {Function} callback - Handler function
   */
  once(eventName, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(eventName, onceWrapper);
    };
    this.on(eventName, onceWrapper);
  }

  /**
   * Clear all subscribers for an event
   * @param {string} eventName - Event name
   */
  clear(eventName) {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }
  }
}

// Create global instance
window.EventBus = new EventBus();

// Common event names (documentation)
window.EVENT_NAMES = {
  CART_UPDATED: 'cart:updated',
  CART_CLEARED: 'cart:cleared',
  ITEM_ADDED_TO_CART: 'cart:item_added',
  ITEM_REMOVED_FROM_CART: 'cart:item_removed',

  FAVORITE_ADDED: 'favorites:added',
  FAVORITE_REMOVED: 'favorites:removed',

  ORDER_PLACED: 'order:placed',
  ORDER_STATUS_CHANGED: 'order:status_changed',

  REVIEW_SUBMITTED: 'review:submitted',

  LOYALTY_POINTS_UPDATED: 'loyalty:points_updated',
  LOYALTY_TIER_CHANGED: 'loyalty:tier_changed',

  THEME_CHANGED: 'theme:changed',

  USER_LOGGED_IN: 'user:logged_in',
  USER_LOGGED_OUT: 'user:logged_out',
};
