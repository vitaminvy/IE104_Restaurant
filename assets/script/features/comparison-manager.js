// ================================
// COMPARISON MANAGER
// Compare multiple menu items side-by-side
// ================================

/**
 * ComparisonManager - Manage product comparison feature
 * Features: Add/remove items, show comparison table, max 4 items
 */
class ComparisonManager {
  constructor() {
    this.storageKey = STORAGE_KEYS.COMPARISON_ITEMS;
    this.maxItems = UI_CONFIG.MAX_COMPARISON_ITEMS;
    this.items = this.loadItems();
    this.createComparisonBar();
    this.attachEventHandlers();
  }

  /**
   * Load comparison items from localStorage
   * @returns {Array} Comparison items
   */
  loadItems() {
    return StorageManager.get(this.storageKey, []);
  }

  /**
   * Save items to localStorage
   * @returns {boolean} Success status
   */
  saveItems() {
    const success = StorageManager.set(this.storageKey, this.items);
    this.updateComparisonBar();
    return success;
  }

  /**
   * Add item to comparison
   * @param {Object} item - Menu item
   * @returns {boolean} Success status
   */
  addItem(item) {
    // Check if already in comparison
    if (this.isInComparison(item.id)) {
      if (window.NotificationSystem) {
        window.NotificationSystem.warning('Item already in comparison', {
          duration: TIMINGS.NOTIFICATION_SHORT,
        });
      }
      return false;
    }

    // Check max limit
    if (this.items.length >= this.maxItems) {
      if (window.NotificationSystem) {
        window.NotificationSystem.warning(
          `You can compare up to ${this.maxItems} items`,
          { duration: TIMINGS.NOTIFICATION_SHORT }
        );
      }
      return false;
    }

    // Add item
    this.items.push({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      category: item.category,
      rating: item.rating || DEFAULTS.DEFAULT_RATING,
      desc: item.desc,
      badges: item.badges || [],
      prepTime: item.prepTime || DEFAULTS.DEFAULT_PREP_TIME,
    });

    this.saveItems();

    if (window.NotificationSystem) {
      window.NotificationSystem.success(`${item.title} added to comparison`, {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }

    return true;
  }

  /**
   * Remove item from comparison
   * @param {number} itemId - Item ID
   * @returns {boolean} Success status
   */
  removeItem(itemId) {
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index === -1) return false;

    const removed = this.items.splice(index, 1)[0];
    this.saveItems();

    if (window.NotificationSystem) {
      window.NotificationSystem.info(`${removed.title} removed from comparison`, {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }

    return true;
  }

  /**
   * Toggle item in comparison
   * @param {Object} item - Menu item
   * @returns {boolean} New comparison status
   */
  toggleItem(item) {
    if (this.isInComparison(item.id)) {
      this.removeItem(item.id);
      return false;
    } else {
      this.addItem(item);
      return true;
    }
  }

  /**
   * Check if item is in comparison
   * @param {number} itemId - Item ID
   * @returns {boolean} Is in comparison
   */
  isInComparison(itemId) {
    return this.items.some((i) => i.id === itemId);
  }

  /**
   * Get all comparison items
   * @returns {Array} Comparison items
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Get item count
   * @returns {number} Count
   */
  getCount() {
    return this.items.length;
  }

  /**
   * Clear all comparison items
   * @returns {boolean} Success status
   */
  clearAll() {
    this.items = [];
    this.saveItems();

    if (window.NotificationSystem) {
      window.NotificationSystem.info('Comparison cleared', {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }

    return true;
  }

  /**
   * Create floating comparison bar
   */
  createComparisonBar() {
    const barHTML = `
      <div class="comparison-bar" id="comparison-bar" style="display: none;">
        <div class="comparison-bar__content">
          <div class="comparison-bar__header">
            <div class="comparison-bar__title">
              <span class="comparison-bar__icon">⚖️</span>
              <span class="comparison-bar__text">Compare Items</span>
              <span class="comparison-bar__badge" id="comparison-count">0</span>
            </div>
          </div>
          <div class="comparison-bar__items" id="comparison-bar-items"></div>
          <div class="comparison-bar__actions">
            <button class="comparison-bar__btn comparison-bar__btn--clear" id="clear-comparison-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Clear All
            </button>
            <button class="comparison-bar__btn comparison-bar__btn--compare" id="view-comparison-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              View Comparison
            </button>
          </div>
        </div>
      </div>
    `;

    if (!document.getElementById('comparison-bar')) {
      document.body.insertAdjacentHTML('beforeend', barHTML);
    }

    this.bar = document.getElementById('comparison-bar');
    this.barItems = document.getElementById('comparison-bar-items');
    this.updateComparisonBar();
  }

  /**
   * Update comparison bar display
   */
  updateComparisonBar() {
    if (!this.bar) return;

    const count = this.getCount();

    // Show/hide bar
    this.bar.style.display = count > 0 ? 'flex' : 'none';

    // Update count
    const countEl = document.getElementById('comparison-count');
    if (countEl) {
      countEl.textContent = count;
    }

    // Update items preview
    if (this.barItems) {
      this.barItems.innerHTML = this.items
        .map(
          (item) => `
        <div class="comparison-bar__item" data-item-id="${item.id}">
          <div class="comparison-bar__item-image">
            <img src="${item.image}" alt="${item.title}" />
            <div class="comparison-bar__item-overlay">
              <span class="comparison-bar__item-price">$${item.price.toFixed(2)}</span>
            </div>
          </div>
          <div class="comparison-bar__item-info">
            <h4 class="comparison-bar__item-title">${item.title}</h4>
            <span class="comparison-bar__item-category">${item.category}</span>
          </div>
          <button class="comparison-bar__item-remove" data-item-id="${item.id}" aria-label="Remove ${item.title}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `
        )
        .join('');
    }

    // Update checkboxes on page
    document.querySelectorAll('.compare-checkbox').forEach((checkbox) => {
      const itemId = parseInt(checkbox.dataset.itemId);
      checkbox.checked = this.isInComparison(itemId);
    });
  }

  /**
   * Attach event handlers
   */
  attachEventHandlers() {
    // Clear all button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'clear-comparison-btn') {
        this.clearAll();
      }

      // View comparison button
      if (e.target.id === 'view-comparison-btn' || e.target.closest('#view-comparison-btn')) {
        this.showComparisonModal();
      }

      // Remove from bar
      const removeBtn = e.target.closest('.comparison-bar__item-remove');
      if (removeBtn) {
        const itemId = parseInt(removeBtn.dataset.itemId);
        this.removeItem(itemId);
      }

      // Compare checkbox
      const checkbox = e.target.closest('.compare-checkbox');
      if (checkbox) {
        const itemId = parseInt(checkbox.dataset.itemId);
        const item = this.getItemFromPage(itemId);
        if (item) {
          this.toggleItem(item);
        }
      }
    });
  }

  /**
   * Show comparison modal/page
   */
  showComparisonModal() {
    if (this.items.length < 2) {
      if (window.NotificationSystem) {
        window.NotificationSystem.warning('Add at least 2 items to compare', {
          duration: TIMINGS.NOTIFICATION_SHORT,
        });
      }
      return;
    }

    // Create or navigate to comparison page
    // For now, create modal
    this.createComparisonModal();
  }

  /**
   * Create comparison modal
   */
  createComparisonModal() {
    const modalHTML = `
      <div class="comparison-modal-overlay" id="comparison-modal">
        <div class="comparison-modal">
          <div class="comparison-modal__header">
            <div class="comparison-modal__title">
              <span class="comparison-modal__icon">⚖️</span>
              <h2>Product Comparison</h2>
            </div>
            <button class="comparison-modal__close" id="close-comparison-modal" aria-label="Close comparison">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="comparison-modal__body">
            <div class="comparison-table-wrapper">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th class="comparison-table__feature">Feature</th>
                    ${this.items.map((item) => `
                      <th class="comparison-table__product">
                        <div class="comparison-product-header">
                          <img src="${item.image}" alt="${item.title}" class="comparison-product-img" />
                          <h3 class="comparison-product-title">${item.title}</h3>
                          <span class="comparison-product-category">${item.category}</span>
                        </div>
                      </th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody>
                  <tr class="comparison-row">
                    <td class="comparison-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      Price
                    </td>
                    ${this.items.map((item) => `
                      <td class="comparison-value comparison-value--price">
                        <span class="comparison-price">$${item.price.toFixed(2)}</span>
                      </td>
                    `).join('')}
                  </tr>
                  <tr class="comparison-row">
                    <td class="comparison-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      Rating
                    </td>
                    ${this.items.map((item) => `
                      <td class="comparison-value">
                        <div class="comparison-rating">
                          <span class="comparison-rating-value">${item.rating}</span>
                          <span class="comparison-rating-stars">${'⭐'.repeat(Math.floor(item.rating))}</span>
                        </div>
                      </td>
                    `).join('')}
                  </tr>
                  <tr class="comparison-row">
                    <td class="comparison-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Prep Time
                    </td>
                    ${this.items.map((item) => `
                      <td class="comparison-value">${item.prepTime} min</td>
                    `).join('')}
                  </tr>
                  <tr class="comparison-row">
                    <td class="comparison-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      Description
                    </td>
                    ${this.items.map((item) => `
                      <td class="comparison-value comparison-desc">${item.desc || 'N/A'}</td>
                    `).join('')}
                  </tr>
                  <tr class="comparison-row">
                    <td class="comparison-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      Dietary Info
                    </td>
                    ${this.items.map((item) => `
                      <td class="comparison-value">
                        <div class="comparison-badges">
                          ${item.badges && item.badges.length > 0
                            ? item.badges.map(badge => `<span class="comparison-badge">${badge}</span>`).join('')
                            : '<span class="comparison-badge-empty">None</span>'}
                        </div>
                      </td>
                    `).join('')}
                  </tr>
                  <tr class="comparison-row comparison-row--actions">
                    <td class="comparison-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Actions
                    </td>
                    ${this.items.map((item) => `
                      <td class="comparison-value">
                        <button class="comparison-add-btn add-to-cart-from-comparison" data-item-id="${item.id}">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                          </svg>
                          Add to Cart
                        </button>
                      </td>
                    `).join('')}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('comparison-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Insert new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('comparison-modal');

    // Close button
    document.getElementById('close-comparison-modal').addEventListener('click', () => {
      modal.remove();
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Add to cart from comparison
    modal.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-to-cart-from-comparison');
      if (btn) {
        const itemId = parseInt(btn.dataset.itemId);
        const item = this.items.find((i) => i.id === itemId);
        if (item && window.enhancedAddToCart) {
          window.enhancedAddToCart(item, btn, false);
        }
      }
    });
  }

  /**
   * Get item data from page
   * @param {number} itemId - Item ID
   * @returns {Object|null} Item data
   */
  getItemFromPage(itemId) {
    if (window.menuData) {
      return window.menuData.find((item) => item.id === itemId);
    }
    return null;
  }
}

// Initialize
window.ComparisonManager = new ComparisonManager();

console.log('✅ Comparison Manager initialized');
