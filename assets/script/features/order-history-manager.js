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

    // Get current cart
    let cart = StorageManager.get(STORAGE_KEYS.CART, []);

    // Add items from order to cart
    order.items.forEach((orderItem) => {
      // Check if item already in cart
      const existingIndex = cart.findIndex((c) => c.id === orderItem.id);

      if (existingIndex > -1) {
        // Increase quantity
        cart[existingIndex].quantity += orderItem.quantity;
      } else {
        // Add new item
        cart.push({
          id: orderItem.id,
          title: orderItem.title,
          price: orderItem.price,
          image: orderItem.image,
          quantity: orderItem.quantity,
        });
      }
    });

    // Save updated cart
    StorageManager.set(STORAGE_KEYS.CART, cart);

    // Emit cart updated event
    EventBus.emit(EVENT_NAMES.CART_UPDATED, { cart });

    // Show success notification
    if (window.NotificationSystem) {
      window.NotificationSystem.success(
        `${order.items.length} items added to cart!`,
        { duration: TIMINGS.NOTIFICATION_MEDIUM }
      );
    }

    return true;
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
    if (!order) return;

    console.log('📋 Order Details:', order);

    if (window.NotificationSystem) {
      window.NotificationSystem.info(
        `Order #${orderId.substring(4, 12)} - ${order.items.length} items`,
        { duration: TIMINGS.NOTIFICATION_SHORT }
      );
    }

    // Can be extended to show a detailed modal
  }
}

// Create global instance
window.OrderHistoryManager = new OrderHistoryManager();

console.log('✅ Order History Manager initialized');
