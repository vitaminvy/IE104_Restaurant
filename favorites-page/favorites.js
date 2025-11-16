// ================================
// FAVORITES PAGE SCRIPT
// Renders and manages favorites page
// ================================

/**
 * FavoritesPage - Manages the favorites page display
 */
class FavoritesPage {
  constructor() {
    this.gridElement = document.getElementById('favorites-grid');
    this.emptyElement = document.getElementById('favorites-empty');
    this.init();
  }

  /**
   * Initialize the page
   */
  init() {
    this.renderFavorites();
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Listen for favorites updates
    EventBus.on(EVENT_NAMES.FAVORITES_UPDATED, () => {
      this.renderFavorites();
    });

    // Listen for cart updates
    EventBus.on(EVENT_NAMES.CART_UPDATED, () => {
      // Could update UI if needed
    });
  }

  /**
   * Render all favorite items
   */
  renderFavorites() {
    if (!window.FavoritesManager) {
      console.error('FavoritesManager not loaded');
      return;
    }

    const favorites = window.FavoritesManager.getFavorites();

    if (favorites.length === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();
    this.renderFavoriteItems(favorites);
  }

  /**
   * Show empty state
   */
  showEmptyState() {
    this.gridElement.style.display = 'none';
    this.emptyElement.style.display = 'block';
  }

  /**
   * Hide empty state
   */
  hideEmptyState() {
    this.gridElement.style.display = 'grid';
    this.emptyElement.style.display = 'none';
  }

  /**
   * Render favorite items
   * @param {Array} favorites - Array of favorite items
   */
  renderFavoriteItems(favorites) {
    this.gridElement.innerHTML = favorites
      .map((item) => this.createFavoriteCard(item))
      .join('');

    // Attach event handlers to buttons
    this.attachCardEventHandlers();
  }

  /**
   * Create HTML for a favorite card
   * @param {Object} item - Favorite item
   * @returns {string} HTML string
   */
  createFavoriteCard(item) {
    return `
      <div class="favorite-item animate-scale" data-item-id="${item.id}">
        <div class="favorite-item__image-wrapper">
          <img
            src="${item.image || item.img || '../assets/images/food/default.png'}"
            alt="${item.title || item.name}"
            class="favorite-item__image"
            loading="lazy"
          />
          <button class="favorite-item__remove-btn" data-remove-id="${item.id}" aria-label="Remove from favorites">
            <i class="fa-solid fa-heart-crack"></i>
          </button>
          ${item.badge ? `<span class="favorite-item__badge">${item.badge}</span>` : ''}
        </div>
        <div class="favorite-item__content">
          <div class="favorite-item__category">${item.category || 'Food'}</div>
          <h3 class="favorite-item__title">${item.title || item.name}</h3>
          <p class="favorite-item__description">
            ${item.description || item.desc || 'Delicious dish prepared with care'}
          </p>
          <div class="favorite-item__footer">
            <span class="favorite-item__price">$${(item.price || 0).toFixed(2)}</span>
            <div class="favorite-item__actions">
              <button class="favorite-item__btn" data-add-cart-id="${item.id}">
                Add to Cart
              </button>
              <button class="favorite-item__btn favorite-item__btn--secondary" data-view-id="${item.id}">
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event handlers to card buttons
   */
  attachCardEventHandlers() {
    // Remove from favorites buttons
    document.querySelectorAll('[data-remove-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-remove-id');
        this.removeFromFavorites(itemId);
      });
    });

    // Add to cart buttons
    document.querySelectorAll('[data-add-cart-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-add-cart-id');
        this.addToCart(itemId);
      });
    });

    // View item buttons
    document.querySelectorAll('[data-view-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-view-id');
        this.viewItem(itemId);
      });
    });
  }

  /**
   * Remove item from favorites
   * @param {string} itemId - Item ID
   */
  removeFromFavorites(itemId) {
    if (window.FavoritesManager) {
      window.FavoritesManager.toggleFavorite({ id: itemId });

      // Show notification
      if (window.NotificationSystem) {
        window.NotificationSystem.info('Removed from favorites', {
          duration: TIMINGS.NOTIFICATION_SHORT,
        });
      }
    }
  }

  /**
   * Add item to cart
   * @param {string} itemId - Item ID
   */
  addToCart(itemId) {
    if (!window.FavoritesManager) return;

    const favorites = window.FavoritesManager.getFavorites();
    const item = favorites.find((fav) => fav.id === itemId);

    if (!item) return;

    // Get current cart
    const cart = StorageManager.get(STORAGE_KEYS.CART, []);

    // Check if item already in cart
    const existingIndex = cart.findIndex((cartItem) => cartItem.id === itemId);

    if (existingIndex !== -1) {
      // Increment quantity
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      // Add new item
      cart.push({
        ...item,
        quantity: 1,
      });
    }

    // Save cart
    StorageManager.set(STORAGE_KEYS.CART, cart);

    // Emit cart updated event
    EventBus.emit(EVENT_NAMES.CART_UPDATED, { cart });

    // Show notification
    if (window.NotificationSystem) {
      window.NotificationSystem.success(`${item.title || item.name} added to cart!`, {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }
  }

  /**
   * View item details
   * @param {string} itemId - Item ID
   */
  viewItem(itemId) {
    // Navigate to product detail page with item ID
    window.location.href = `../product-detail-page/index.html?id=${itemId}`;
  }
}

// Initialize the favorites page
document.addEventListener('DOMContentLoaded', () => {
  new FavoritesPage();
});

console.log('✅ Favorites page initialized');
