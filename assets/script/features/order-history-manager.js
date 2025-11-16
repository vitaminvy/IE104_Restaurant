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
    return this.orders.filter(
      (o) => o.placedAt >= startDate && o.placedAt <= endDate
    );
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
    const date = new Date(timestamp);
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
   * Get recent orders (last N orders)
   * @param {number} limit - Number of orders
   * @returns {Array} Recent orders
   */
  getRecentOrders(limit = 5) {
    return this.orders.slice(0, limit);
  }
}

// Create global instance
window.OrderHistoryManager = new OrderHistoryManager();

console.log('✅ Order History Manager initialized');
