// ================================
// STORAGE MANAGER UTILITY
// Safe localStorage wrapper with error handling and validation
// ================================

/**
 * StorageManager - Centralized localStorage operations
 * Provides safe get/set/remove with automatic JSON handling
 */
class StorageManager {
  /**
   * Get item from localStorage with automatic JSON parsing
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Parsed value or default
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`StorageManager.get error for key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage with automatic JSON stringification
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  static set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`StorageManager.set error for key "${key}":`, error);

      // Check for QuotaExceededError
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded');
      }

      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`StorageManager.remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Check if key exists in localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Existence status
   */
  static has(key) {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Clear all localStorage items
   * @returns {boolean} Success status
   */
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('StorageManager.clear error:', error);
      return false;
    }
  }

  /**
   * Get all keys from localStorage
   * @returns {string[]} Array of keys
   */
  static keys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('StorageManager.keys error:', error);
      return [];
    }
  }
}

// Export for use in other modules
window.StorageManager = StorageManager;
