// ================================
// ORDER HISTORY MANAGER
// Track past orders and enable quick reordering
// ================================

/**
 * OrderHistoryManager - Manage user's order history
 * Features: Save orders, view history, quick reorder
 */
class OrderHistoryManager {
  constructor() {
    this.storageKey = STORAGE_KEYS.ORDER_HISTORY;
    this.orders = this.loadOrders();
  }

  /**
   * Load orders from localStorage
   * @returns {Array} Orders array
   */
  loadOrders() {
    return StorageManager.get(this.storageKey, []);
  }

  /**
   * Save orders to localStorage
   * @returns {boolean} Success status
   */
  saveOrders() {
    return StorageManager.set(this.storageKey, this.orders);
  }

  /**
   * Save completed order to history
   * @param {Object} orderData - Order details
   * @returns {Object} Saved order
   */
  saveOrder(orderData) {
    const order = {
      id: orderData.id || 'ORD-' + Date.now(),
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      shipping: orderData.shipping || DEFAULTS.SHIPPING_COST,
      total: orderData.total,
      couponCode: orderData.couponCode || null,
      paymentMethod: orderData.paymentMethod || 'cash',
      deliveryAddress: orderData.deliveryAddress || {},
      status: orderData.status || 'completed',
      placedAt: orderData.placedAt || Date.now(),
      deliveredAt: orderData.deliveredAt || null,
    };

    // Add to beginning of array (newest first)
    this.orders.unshift(order);

    // Keep only last 50 orders
    if (this.orders.length > 50) {
      this.orders = this.orders.slice(0, 50);
    }

    this.saveOrders();

    return order;
  }

  /**
   * Get all orders
   * @returns {Array} Orders array
   */
  getOrders() {
    return [...this.orders];
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Object|null} Order or null
   */
  getOrderById(orderId) {
    return this.orders.find((o) => o.id === orderId) || null;
  }

  /**
   * Get orders within date range
   * @param {number} startDate - Start timestamp
   * @param {number} endDate - End timestamp
   * @returns {Array} Filtered orders
   */
  getOrdersByDateRange(startDate, endDate) {
    return this.orders.filter((o) => {
      const timestamp = this.getOrderTimestamp(o);
      return timestamp >= startDate && timestamp <= endDate;
    });
  }

  /**
   * Get orders by status
   * @param {string} status - Order status
   * @returns {Array} Filtered orders
   */
  getOrdersByStatus(status) {
    return this.orders.filter((o) => o.status === status);
  }

  /**
   * Quick reorder - add all items from previous order to cart
   * @param {string} orderId - Order ID to reorder
   * @returns {boolean} Success status
   */
  reorder(orderId) {
    const order = this.getOrderById(orderId);
    if (!order) {
      if (window.NotificationSystem) {
        window.NotificationSystem.error('Order not found', {
          duration: TIMINGS.NOTIFICATION_SHORT,
        });
      }
      return false;
    }

    console.log('🔄 Reordering order:', orderId, 'with', order.items.length, 'items');

    // Get current cart
    let cart = StorageManager.get(STORAGE_KEYS.CART, []);
    console.log('📦 Current cart:', cart);

    // Track items added
    let itemsAdded = 0;

    // Add items from order to cart
    order.items.forEach((orderItem) => {
      // Check if item already in cart
      const existingIndex = cart.findIndex((c) => c.id === orderItem.id);

      if (existingIndex > -1) {
        // Increase quantity
        cart[existingIndex].quantity += orderItem.quantity;
        console.log(`✅ Updated quantity for: ${orderItem.title}`);
      } else {
        // Add new item with all necessary properties
        cart.push({
          id: orderItem.id,
          title: orderItem.title,
          price: orderItem.price,
          image: orderItem.image,
          quantity: orderItem.quantity,
          category: orderItem.category || 'Food',
          description: orderItem.description || '',
        });
        console.log(`➕ Added new item: ${orderItem.title}`);
      }
      itemsAdded++;
    });

    // Save updated cart
    const saved = StorageManager.set(STORAGE_KEYS.CART, cart);
    console.log('💾 Cart saved:', saved, 'Total items in cart:', cart.length);

    // Emit cart updated event
    if (window.EventBus && typeof window.EventBus.emit === 'function') {
      window.EventBus.emit(EVENT_NAMES.CART_UPDATED, { cart });
      console.log('📢 EventBus emitted CART_UPDATED');
    }

    // Manually update cart badge
    const cartBadge = document.querySelector('.cart-count');
    if (cartBadge) {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartBadge.textContent = totalItems;
      if (totalItems > 0) {
        cartBadge.style.display = 'flex';
      }
      console.log('🔢 Cart badge updated:', totalItems);
    }

    // Update header cart icon if exists
    const headerCartCount = document.querySelector('.header-cart-count');
    if (headerCartCount) {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      headerCartCount.textContent = totalItems;
      headerCartCount.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }

    // Show success notification with action
    if (window.NotificationSystem) {
      window.NotificationSystem.success(
        `${itemsAdded} item${itemsAdded > 1 ? 's' : ''} added to cart!`,
        { duration: TIMINGS.NOTIFICATION_MEDIUM }
      );
    }

    // Show professional popup to navigate to cart
    setTimeout(() => {
      this.showViewCartPopup(itemsAdded);
    }, 1000);

    console.log('✅ Reorder completed successfully');
    return true;
  }

  /**
   * Show professional popup to view cart after reorder
   * @param {number} itemsAdded - Number of items added
   */
  showViewCartPopup(itemsAdded) {
    const popupHTML = `
      <div class="order-modal-overlay active" id="view-cart-popup">
        <div class="order-modal" style="max-width: 500px; animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <div class="order-modal__header">
            <div class="order-modal__title-section">
              <h2 class="order-modal__title">Items Added to Cart</h2>
            </div>
            <button class="order-modal__close" id="close-cart-popup">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="order-modal__body">
            <div style="text-align: center; padding: 20px 0;">
              <div style="font-size: 64px; margin-bottom: 16px;">🛒</div>
              <p style="font-size: 16px; color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0;">
                Successfully added <strong style="color: var(--color-dark-orange, #fb8f2c);">${itemsAdded} item${itemsAdded > 1 ? 's' : ''}</strong> to your cart!
              </p>
              <p style="font-size: 14px; color: rgba(255, 255, 255, 0.6); margin-top: 12px;">
                Would you like to view your cart now?
              </p>
            </div>
          </div>
          <div class="order-modal__footer">
            <button class="order-modal__btn order-modal__btn--secondary" id="continue-shopping-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Continue Shopping
            </button>
            <button class="order-modal__btn order-modal__btn--primary" id="view-cart-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              View Cart
            </button>
          </div>
        </div>
      </div>
    `;

    // Remove existing popup if any
    const existingPopup = document.getElementById('view-cart-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Add popup to body
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Get elements
    const popup = document.getElementById('view-cart-popup');
    const closeBtn = document.getElementById('close-cart-popup');
    const continueBtn = document.getElementById('continue-shopping-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');

    // Close popup function
    const closePopup = () => {
      popup.classList.remove('active');
      setTimeout(() => {
        popup.remove();
      }, 300);
    };

    // Event listeners
    closeBtn.addEventListener('click', closePopup);

    continueBtn.addEventListener('click', closePopup);

    viewCartBtn.addEventListener('click', () => {
      window.location.href = '../cartpage/cart.html';
    });

    // Close on overlay click
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        closePopup();
      }
    });

    // ESC key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closePopup();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    console.log('🛒 View cart popup displayed');
  }

  /**
   * Get total spent by user
   * @returns {number} Total amount
   */
  getTotalSpent() {
    return this.orders.reduce((total, order) => total + order.total, 0);
  }

  /**
   * Get order statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const totalOrders = this.orders.length;
    const totalSpent = this.getTotalSpent();
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Most ordered items
    const itemFrequency = {};
    this.orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemFrequency[item.id]) {
          itemFrequency[item.id] = {
            id: item.id,
            title: item.title,
            count: 0,
          };
        }
        itemFrequency[item.id].count += item.quantity;
      });
    });

    const favoriteItems = Object.values(itemFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrders,
      totalSpent,
      avgOrderValue,
      favoriteItems,
    };
  }

  /**
   * Clear all order history
   * @returns {boolean} Success status
   */
  clearHistory() {
    this.orders = [];
    this.saveOrders();

    if (window.NotificationSystem) {
      window.NotificationSystem.info('Order history cleared', {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }

    return true;
  }

  /**
   * Format order date for display
   * @param {number} timestamp - Order timestamp
   * @returns {string} Formatted date
   */
  formatOrderDate(timestamp) {
    // Handle both timestamp and date string formats
    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Get timestamp from order (handles both placedAt and date fields)
   * @param {Object} order - Order object
   * @returns {number} Timestamp
   */
  getOrderTimestamp(order) {
    // Try placedAt first (new format)
    if (order.placedAt) {
      return typeof order.placedAt === 'number' ? order.placedAt : new Date(order.placedAt).getTime();
    }
    // Fall back to date field (old format)
    if (order.date) {
      return typeof order.date === 'number' ? order.date : new Date(order.date).getTime();
    }
    // Default to current time if neither exists
    return Date.now();
  }

  /**
   * Get recent orders (last N orders)
   * @param {number} limit - Number of orders
   * @returns {Array} Recent orders
   */
  getRecentOrders(limit = 5) {
    return this.orders.slice(0, limit);
  }

  /**
   * Get enhanced statistics for dashboard
   * @returns {Object} Enhanced statistics
   */
  getStatistics() {
    const totalOrders = this.orders.length;
    const totalSpent = this.getTotalSpent();
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Calculate total items across all orders
    const totalItems = this.orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    // Most ordered items with images
    const itemFrequency = {};
    this.orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemFrequency[item.id]) {
          itemFrequency[item.id] = {
            id: item.id,
            title: item.title,
            image: item.image,
            price: item.price,
            count: 0,
          };
        }
        itemFrequency[item.id].count += item.quantity;
      });
    });

    const favoriteItems = Object.values(itemFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Orders by status
    const ordersByStatus = {
      pending: this.orders.filter(o => o.status === 'pending').length,
      preparing: this.orders.filter(o => o.status === 'preparing').length,
      ready: this.orders.filter(o => o.status === 'ready').length,
      delivered: this.orders.filter(o => o.status === 'delivered').length,
      cancelled: this.orders.filter(o => o.status === 'cancelled').length,
    };

    // Recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentOrders = this.orders.filter(o => this.getOrderTimestamp(o) >= sevenDaysAgo);

    return {
      totalOrders,
      totalSpent,
      avgOrderValue,
      totalItems,
      favoriteItems,
      ordersByStatus,
      recentOrdersCount: recentOrders.length,
    };
  }

  /**
   * Filter orders by date range
   * @param {string} range - 'week', 'month', 'year', 'all'
   * @returns {Array} Filtered orders
   */
  filterByDateRange(range) {
    const now = Date.now();
    let startDate;

    switch (range) {
      case 'week':
        startDate = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = now - (365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return this.orders;
    }

    return this.orders.filter(o => this.getOrderTimestamp(o) >= startDate);
  }

  /**
   * Search orders by item name or order ID
   * @param {string} query - Search query
   * @returns {Array} Matching orders
   */
  searchOrders(query) {
    if (!query || query.trim() === '') return this.orders;

    const lowerQuery = query.toLowerCase().trim();

    return this.orders.filter(order => {
      // Search in order ID
      if (order.id.toLowerCase().includes(lowerQuery)) return true;

      // Search in item names
      return order.items.some(item =>
        item.title.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Create order card HTML element
   * @param {Object} order - Order object
   * @returns {string} HTML string
   */
  createOrderCardElement(order) {
    const timestamp = this.getOrderTimestamp(order);
    const formattedDate = this.formatOrderDate(timestamp);
    const statusClass = (order.status || 'pending').replace(/-/g, '_');

    // Calculate order items preview
    const itemsPreview = order.items.slice(0, 2).map(item => `
      <div class="history__order-item-preview">
        <img src="${item.image}" alt="${item.title}" class="history__order-item-image" />
        <div class="history__order-item-info">
          <span class="history__order-item-name">${item.title}</span>
          <span class="history__order-item-qty">×${item.quantity}</span>
        </div>
        <span class="history__order-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    const remainingItems = order.items.length - 2;

    return `
      <div class="history__order-card animate-scale" data-order-id="${order.id}">
        <!-- Card Header -->
        <div class="history__order-header">
          <div class="history__order-header-left">
            <h3 class="history__order-id">#${order.id.substring(4, 12).toUpperCase()}</h3>
            <p class="history__order-date">${formattedDate}</p>
          </div>
          <div class="history__order-header-right">
            <span class="history__status-badge status-badge--${statusClass}">
              ${order.status.replace(/-/g, ' ')}
            </span>
          </div>
        </div>

        <!-- Items Preview -->
        <div class="history__order-items">
          ${itemsPreview}
          ${remainingItems > 0 ? `
            <div class="history__order-more-items">
              + ${remainingItems} more item${remainingItems > 1 ? 's' : ''}
            </div>
          ` : ''}
        </div>

        <!-- Order Summary -->
        <div class="history__order-summary">
          <div class="history__order-info">
            <div class="history__order-info-item">
              <svg class="history__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3zM3 9h18M9 21V9"></path>
              </svg>
              <span>${order.items.length} item${order.items.length > 1 ? 's' : ''}</span>
            </div>
            <div class="history__order-info-item">
              <svg class="history__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <span>${order.paymentMethod || 'Cash'}</span>
            </div>
          </div>
          <div class="history__order-total">
            <span class="history__order-total-label">Total</span>
            <span class="history__order-total-amount">$${order.total.toFixed(2)}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="history__order-actions">
          <button class="history__btn history__btn--details" onclick="window.OrderHistoryManager.viewOrderDetails('${order.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            View Details
          </button>
          <button class="history__btn history__btn--reorder" onclick="window.OrderHistoryManager.reorder('${order.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Reorder
          </button>
        </div>
      </div>
    `;
  }

  /**
   * View order details (can be extended to show modal)
   * @param {string} orderId - Order ID
   */
  viewOrderDetails(orderId) {
    const order = this.getOrderById(orderId);
    if (!order) {
      if (window.NotificationSystem) {
        window.NotificationSystem.error('Order not found', {
          duration: TIMINGS.NOTIFICATION_SHORT
        });
      }
      return;
    }

    // Create modal HTML
    const modalHTML = this.createOrderDetailsModal(order);

    // Remove existing modal if any
    const existingModal = document.querySelector('.order-modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get modal element
    const modalOverlay = document.querySelector('.order-modal-overlay');
    const closeBtn = modalOverlay.querySelector('.order-modal__close');
    const reorderBtn = modalOverlay.querySelector('.order-modal__btn--primary');

    // Show modal with animation
    requestAnimationFrame(() => {
      modalOverlay.classList.add('active');
    });

    // Close modal function
    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => {
        modalOverlay.remove();
      }, 300);
    };

    // Event listeners
    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    // Reorder button
    if (reorderBtn) {
      reorderBtn.addEventListener('click', () => {
        closeModal();
        setTimeout(() => {
          this.reorderWithConfirmation(orderId);
        }, 300);
      });
    }

    // ESC key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    console.log('📋 Order Details Modal opened:', orderId);
  }

  /**
   * Create order details modal HTML
   * @param {Object} order - Order object
   * @returns {string} Modal HTML
   */
  createOrderDetailsModal(order) {
    const timestamp = this.getOrderTimestamp(order);
    const formattedDate = this.formatOrderDate(timestamp);
    const statusSteps = this.getOrderStatusSteps();
    const currentStepIndex = this.getCurrentStepIndex(order.status || 'placed');

    // Generate status timeline
    const timelineHTML = statusSteps.map((step, index) => {
      const isCompleted = index <= currentStepIndex;
      const isCurrent = index === currentStepIndex;
      const stepClass = isCompleted ? 'status-timeline-step--completed' : '';
      const currentClass = isCurrent ? 'status-timeline-step--current' : '';

      return `
        <div class="status-timeline-step ${stepClass} ${currentClass}">
          <div class="status-timeline-icon">${step.icon}</div>
          <div class="status-timeline-content">
            <div class="status-timeline-label">${step.label}</div>
            <div class="status-timeline-description">${step.description}</div>
          </div>
        </div>
      `;
    }).join('');

    // Generate order items
    const itemsHTML = order.items.map(item => `
      <div class="order-item-card">
        <img src="${item.image}" alt="${item.title}" class="order-item-image" />
        <div class="order-item-info">
          <div class="order-item-name">${item.title}</div>
          <div class="order-item-quantity">Quantity: ${item.quantity}</div>
        </div>
        <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');

    // Generate delivery address
    const addr = order.deliveryAddress || {};
    const addressHTML = `
      <div class="delivery-address-card">
        ${addr.firstName || addr.lastName ? `
          <div class="delivery-address-row">
            <svg class="delivery-address-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div class="delivery-address-content">
              <div class="delivery-address-label">Name</div>
              <div class="delivery-address-value">${addr.firstName || ''} ${addr.lastName || ''}</div>
            </div>
          </div>
        ` : ''}
        ${addr.street1 ? `
          <div class="delivery-address-row">
            <svg class="delivery-address-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <div class="delivery-address-content">
              <div class="delivery-address-label">Address</div>
              <div class="delivery-address-value">
                ${addr.street1}${addr.street2 ? ', ' + addr.street2 : ''}<br>
                ${addr.city || ''}${addr.district ? ', ' + addr.district : ''}${addr.zip ? ' ' + addr.zip : ''}<br>
                ${addr.country || ''}
              </div>
            </div>
          </div>
        ` : ''}
        ${addr.phone ? `
          <div class="delivery-address-row">
            <svg class="delivery-address-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <div class="delivery-address-content">
              <div class="delivery-address-label">Phone</div>
              <div class="delivery-address-value">${addr.phone}</div>
            </div>
          </div>
        ` : ''}
        ${addr.email ? `
          <div class="delivery-address-row">
            <svg class="delivery-address-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <div class="delivery-address-content">
              <div class="delivery-address-label">Email</div>
              <div class="delivery-address-value">${addr.email}</div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    return `
      <div class="order-modal-overlay">
        <div class="order-modal">
          <!-- Header -->
          <div class="order-modal__header">
            <div class="order-modal__title-section">
              <h2 class="order-modal__title">
                <span>Order Details</span>
              </h2>
              <div class="order-modal__subtitle">
                <span class="order-modal__order-id">#${order.id.substring(4, 12).toUpperCase()}</span>
                <span class="order-modal__date">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  ${formattedDate}
                </span>
              </div>
            </div>
            <button class="order-modal__close" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="order-modal__body">
            <!-- Order Status Section -->
            <div class="order-status-section">
              <div class="order-status-header">
                <div class="order-current-status">
                  <span class="order-current-status__label">Current Status</span>
                  <span class="order-current-status__badge">${(order.status || 'placed').replace(/-/g, ' ')}</span>
                </div>
              </div>
              <div class="order-status-timeline">
                ${timelineHTML}
              </div>
            </div>

            <!-- Order Items Section -->
            <div class="modal-section">
              <h3 class="modal-section__title">
                <svg class="modal-section__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Order Items (${order.items.length})
              </h3>
              <div class="order-items-list">
                ${itemsHTML}
              </div>
            </div>

            <!-- Delivery Address Section -->
            ${Object.keys(addr).length > 0 ? `
              <div class="modal-section">
                <h3 class="modal-section__title">
                  <svg class="modal-section__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  Delivery Address
                </h3>
                ${addressHTML}
              </div>
            ` : ''}

            <!-- Order Summary Section -->
            <div class="modal-section">
              <h3 class="modal-section__title">
                <svg class="modal-section__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Order Summary
              </h3>
              <div class="order-summary-card">
                <div class="order-summary-row">
                  <span class="order-summary-label">Subtotal</span>
                  <span class="order-summary-value">$${order.subtotal.toFixed(2)}</span>
                </div>
                ${order.discount > 0 ? `
                  <div class="order-summary-row">
                    <span class="order-summary-label">Discount${order.couponCode ? ` (${order.couponCode})` : ''}</span>
                    <span class="order-summary-value order-summary-value--discount">-$${order.discount.toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="order-summary-row">
                  <span class="order-summary-label">Shipping</span>
                  <span class="order-summary-value">$${order.shipping.toFixed(2)}</span>
                </div>
                <div class="order-summary-row">
                  <span class="order-summary-label">Payment Method</span>
                  <span class="order-summary-value" style="text-transform: capitalize;">${order.paymentMethod || 'N/A'}</span>
                </div>
                <div class="order-summary-row order-summary-row--total">
                  <span class="order-summary-label">Total</span>
                  <span class="order-summary-value">$${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="order-modal__footer">
            <button class="order-modal__btn order-modal__btn--secondary" onclick="this.closest('.order-modal-overlay').querySelector('.order-modal__close').click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Close
            </button>
            <button class="order-modal__btn order-modal__btn--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Reorder
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get order status steps
   * @returns {Array} Status steps
   */
  getOrderStatusSteps() {
    return [
      { key: 'placed', label: 'Order Placed', icon: '📝', description: 'Your order has been received' },
      { key: 'confirmed', label: 'Confirmed', icon: '✅', description: 'Restaurant confirmed your order' },
      { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', description: 'Chef is preparing your food' },
      { key: 'ready', label: 'Ready', icon: '🍽️', description: 'Your order is ready' },
      { key: 'out-for-delivery', label: 'Out for Delivery', icon: '🚚', description: 'Delivery in progress' },
      { key: 'delivered', label: 'Delivered', icon: '✨', description: 'Enjoy your meal!' }
    ];
  }

  /**
   * Get current step index for order status
   * @param {string} status - Order status
   * @returns {number} Step index
   */
  getCurrentStepIndex(status) {
    const steps = this.getOrderStatusSteps();
    const index = steps.findIndex(step => step.key === status);
    return index !== -1 ? index : 0;
  }

  /**
   * Reorder with confirmation dialog
   * @param {string} orderId - Order ID
   * @returns {boolean} Success status
   */
  reorderWithConfirmation(orderId) {
    const order = this.getOrderById(orderId);
    if (!order) {
      if (window.NotificationSystem) {
        window.NotificationSystem.error('Order not found', {
          duration: TIMINGS.NOTIFICATION_SHORT,
        });
      }
      return false;
    }

    // Create confirmation modal
    const confirmHTML = `
      <div class="order-modal-overlay active" id="reorder-confirm-modal">
        <div class="order-modal" style="max-width: 500px;">
          <div class="order-modal__header">
            <div class="order-modal__title-section">
              <h2 class="order-modal__title">Confirm Reorder</h2>
            </div>
            <button class="order-modal__close" onclick="document.getElementById('reorder-confirm-modal').remove()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="order-modal__body">
            <div style="text-align: center; padding: 20px 0;">
              <div style="font-size: 64px; margin-bottom: 16px;">🛒</div>
              <p style="font-size: 16px; color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0;">
                Add all <strong style="color: var(--color-dark-orange, #fb8f2c);">${order.items.length} items</strong> from this order to your cart?
              </p>
            </div>
          </div>
          <div class="order-modal__footer">
            <button class="order-modal__btn order-modal__btn--secondary" onclick="document.getElementById('reorder-confirm-modal').remove()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Cancel
            </button>
            <button class="order-modal__btn order-modal__btn--primary" id="confirm-reorder-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Yes, Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', confirmHTML);

    const confirmBtn = document.getElementById('confirm-reorder-btn');
    confirmBtn.addEventListener('click', () => {
      document.getElementById('reorder-confirm-modal').remove();
      this.reorder(orderId);
    });

    return true;
  }
}

// Create global instance
window.OrderHistoryManager = new OrderHistoryManager();

console.log('✅ Order History Manager initialized');
