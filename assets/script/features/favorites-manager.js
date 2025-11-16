// ================================
// FAVORITES MANAGER
// localStorage-based wishlist system with event notifications
// ================================

/**
 * FavoritesManager - Manage user's favorite menu items
 * Features: Add, remove, persist to localStorage, event notifications
 */
class FavoritesManager {
  constructor() {
    this.storageKey = STORAGE_KEYS.FAVORITES;
    this.favorites = this.loadFavorites();
    this.listeners = [];
  }

  /**
   * Load favorites from localStorage
   * @returns {Array} Favorites array
   */
  loadFavorites() {
    return StorageManager.get(this.storageKey, []);
  }

  /**
   * Save favorites to localStorage
   * @returns {boolean} Success status
   */
  saveFavorites() {
    const success = StorageManager.set(this.storageKey, this.favorites);
    if (success) {
      this.notifyListeners();
      EventBus.emit(EVENT_NAMES.FAVORITE_ADDED, { count: this.favorites.length });
    }
    return success;
  }

  /**
   * Add item to favorites
   * @param {Object} item - Menu item to add
   * @returns {boolean} Success status
   */
  addFavorite(item) {
    // Check if already favorited
    if (this.isFavorite(item.id)) {
      return false;
    }

    // Check max favorites limit
    if (this.favorites.length >= UI_CONFIG.MAX_FAVORITES) {
      if (window.NotificationSystem) {
        window.NotificationSystem.warning(
          `You can only have ${UI_CONFIG.MAX_FAVORITES} favorites`,
          { duration: TIMINGS.NOTIFICATION_SHORT }
        );
      }
      return false;
    }

    // Add to favorites
    this.favorites.push({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      category: item.category,
      rating: item.rating || DEFAULTS.DEFAULT_RATING,
      addedAt: Date.now(),
    });

    this.saveFavorites();

    // Show notification
    if (window.NotificationSystem) {
      window.NotificationSystem.success(`${item.title} added to favorites`, {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }

    // Emit event
    EventBus.emit(EVENT_NAMES.FAVORITE_ADDED, { item });

    return true;
  }

  /**
   * Remove item from favorites
   * @param {number} itemId - Item ID to remove
   * @returns {boolean} Success status
   */
  removeFavorite(itemId) {
    const index = this.favorites.findIndex((f) => f.id === itemId);
    if (index === -1) return false;

    const removed = this.favorites.splice(index, 1)[0];
    this.saveFavorites();

    // Show notification
    if (window.NotificationSystem) {
      window.NotificationSystem.info(`${removed.title} removed from favorites`, {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }

    // Emit event
    EventBus.emit(EVENT_NAMES.FAVORITE_REMOVED, { item: removed });

    return true;
  }

  /**
   * Toggle favorite status
   * @param {Object} item - Menu item
   * @returns {boolean} New favorite status
   */
  toggleFavorite(item) {
    if (this.isFavorite(item.id)) {
      this.removeFavorite(item.id);
      return false;
    } else {
      this.addFavorite(item);
      return true;
    }
  }

  /**
   * Check if item is favorited
   * @param {number} itemId - Item ID
   * @returns {boolean} Is favorited
   */
  isFavorite(itemId) {
    return this.favorites.some((f) => f.id === itemId);
  }

  /**
   * Get all favorites
   * @returns {Array} Favorites array
   */
  getFavorites() {
    return [...this.favorites];
  }

  /**
   * Get favorites count
   * @returns {number} Count
   */
  getCount() {
    return this.favorites.length;
  }

  /**
   * Clear all favorites
   * @returns {boolean} Success status
   */
  clearAll() {
    this.favorites = [];
    this.saveFavorites();

    if (window.NotificationSystem) {
      window.NotificationSystem.info('All favorites cleared', {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }

    return true;
  }

  /**
   * Register change listener
   * @param {Function} callback - Callback function
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.favorites);
      } catch (error) {
        console.error('Error in favorites listener:', error);
      }
    });
  }

  /**
   * Sort favorites by specified criterion
   * @param {string} sortBy - Sort criterion
   * @returns {Array} Sorted favorites
   */
  getSortedFavorites(sortBy = 'addedAt') {
    const sorted = [...this.favorites];

    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'addedAt':
      default:
        return sorted.sort((a, b) => b.addedAt - a.addedAt);
    }
  }
}

// Create global instance
window.FavoritesManager = new FavoritesManager();

console.log('✅ Favorites Manager initialized');
