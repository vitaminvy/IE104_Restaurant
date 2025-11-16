// ================================
// ORDER TRACKING MANAGER
// Real-time order status tracking
// ================================

/**
 * OrderTrackingManager - Track order status with visual progress
 * Features: Status updates, progress visualization, estimated delivery
 */
class OrderTrackingManager {
  constructor() {
    this.storageKey = STORAGE_KEYS.ORDER_HISTORY;
    this.statusSteps = [
      {
        key: 'placed',
        label: 'Order Placed',
        icon: '📝',
        description: 'Your order has been received'
      },
      {
        key: 'confirmed',
        label: 'Confirmed',
        icon: '✅',
        description: 'Restaurant confirmed your order'
      },
      {
        key: 'preparing',
        label: 'Preparing',
        icon: '👨‍🍳',
        description: 'Chef is preparing your food'
      },
      {
        key: 'ready',
        label: 'Ready',
        icon: '🍽️',
        description: 'Your order is ready'
      },
      {
        key: 'out-for-delivery',
        label: 'Out for Delivery',
        icon: '🚚',
        description: 'Delivery in progress'
      },
      {
        key: 'delivered',
        label: 'Delivered',
        icon: '✨',
        description: 'Enjoy your meal!'
      }
    ];
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Object|null} Order or null
   */
  getOrder(orderId) {
    const orders = StorageManager.get(this.storageKey, []);
    return orders.find(o => o.id === orderId) || null;
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} newStatus - New status
   * @returns {boolean} Success status
   */
  updateOrderStatus(orderId, newStatus) {
    const orders = StorageManager.get(this.storageKey, []);
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) return false;

    orders[orderIndex].status = newStatus;
    orders[orderIndex].updatedAt = Date.now();

    // Set delivery time if delivered
    if (newStatus === 'delivered' && !orders[orderIndex].deliveredAt) {
      orders[orderIndex].deliveredAt = Date.now();
    }

    StorageManager.set(this.storageKey, orders);

    // Emit event
    EventBus.emit(EVENT_NAMES.ORDER_STATUS_UPDATED, {
      orderId,
      status: newStatus
    });

    return true;
  }

  /**
   * Get current step index for order
   * @param {string} status - Order status
   * @returns {number} Step index
   */
  getCurrentStepIndex(status) {
    const index = this.statusSteps.findIndex(step => step.key === status);
    return index !== -1 ? index : 0;
  }

  /**
   * Calculate estimated delivery time
   * @param {Object} order - Order object
   * @returns {string} Formatted time
   */
  getEstimatedDelivery(order) {
    if (order.status === 'delivered') {
      return 'Delivered';
    }

    // Calculate based on placement time + average delivery (45 mins)
    const timestamp = this.getOrderTimestamp(order);
    const placedTime = new Date(timestamp);
    const estimatedTime = new Date(placedTime.getTime() + 45 * 60000);

    // If current time is past estimated time, show "Soon"
    if (Date.now() > estimatedTime.getTime()) {
      return 'Arriving Soon';
    }

    const hours = estimatedTime.getHours();
    const minutes = estimatedTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes} ${ampm}`;
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
   * Get time elapsed since order placed
   * @param {number} timestamp - Order timestamp
   * @returns {string} Formatted time
   */
  getTimeElapsed(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  /**
   * Create order tracker HTML element
   * @param {string} orderId - Order ID
   * @returns {string} HTML string
   */
  createTrackerElement(orderId) {
    const order = this.getOrder(orderId);
    if (!order) return '';

    const currentStepIndex = this.getCurrentStepIndex(order.status || 'placed');
    const estimatedDelivery = this.getEstimatedDelivery(order);
    const timestamp = this.getOrderTimestamp(order);
    const timeElapsed = this.getTimeElapsed(timestamp);

    // Progress percentage
    const progressPercent = ((currentStepIndex + 1) / this.statusSteps.length) * 100;

    // Generate status steps HTML
    const stepsHTML = this.statusSteps.map((step, index) => {
      const isCompleted = index <= currentStepIndex;
      const isCurrent = index === currentStepIndex;
      const stepClass = isCompleted ? 'step--completed' : '';
      const currentClass = isCurrent ? 'step--current' : '';

      return `
        <div class="tracker__step ${stepClass} ${currentClass}">
          <div class="tracker__step-icon">
            <span class="tracker__step-emoji">${step.icon}</span>
            <div class="tracker__step-circle"></div>
          </div>
          <div class="tracker__step-content">
            <h4 class="tracker__step-label">${step.label}</h4>
            <p class="tracker__step-description">${step.description}</p>
          </div>
        </div>
      `;
    }).join('');

    // Generate order items HTML
    const itemsHTML = order.items.slice(0, 3).map(item => `
      <div class="tracker__item">
        <img src="${item.image}" alt="${item.title}" class="tracker__item-image" />
        <div class="tracker__item-info">
          <span class="tracker__item-name">${item.title}</span>
          <span class="tracker__item-quantity">×${item.quantity}</span>
        </div>
      </div>
    `).join('');

    const remainingItems = order.items.length - 3;

    return `
      <div class="order-tracker animate-fade" data-order-id="${order.id}">
        <!-- Order Header -->
        <div class="tracker__header">
          <div class="tracker__header-left">
            <h3 class="tracker__order-id">Order #${order.id}</h3>
            <p class="tracker__order-time">${timeElapsed}</p>
          </div>
          <div class="tracker__header-right">
            <div class="tracker__status-badge status-badge--${order.status}">
              ${order.status.replace(/-/g, ' ')}
            </div>
          </div>
        </div>

        <!-- Estimated Delivery -->
        <div class="tracker__delivery-info">
          <div class="tracker__delivery-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="tracker__delivery-text">
            <span class="tracker__delivery-label">Estimated Delivery</span>
            <span class="tracker__delivery-time">${estimatedDelivery}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="tracker__progress">
          <div class="tracker__progress-bar">
            <div class="tracker__progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div class="tracker__progress-text">${Math.round(progressPercent)}% Complete</div>
        </div>

        <!-- Status Steps -->
        <div class="tracker__steps">
          ${stepsHTML}
        </div>

        <!-- Order Items Summary -->
        <div class="tracker__items">
          <h4 class="tracker__items-title">Order Items (${order.items.length})</h4>
          <div class="tracker__items-list">
            ${itemsHTML}
            ${remainingItems > 0 ? `<div class="tracker__items-more">+${remainingItems} more</div>` : ''}
          </div>
        </div>

        <!-- Order Total -->
        <div class="tracker__footer">
          <div class="tracker__total">
            <span class="tracker__total-label">Total Amount</span>
            <span class="tracker__total-amount">$${order.total.toFixed(2)}</span>
          </div>
          ${order.status !== 'delivered' ? `
            <button class="tracker__contact-btn" onclick="window.OrderTrackingManager.contactSupport('${order.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Contact Support
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Contact support for order
   * @param {string} orderId - Order ID
   */
  contactSupport(orderId) {
    const order = this.getOrder(orderId);
    if (!order) return;

    if (window.NotificationSystem) {
      window.NotificationSystem.info(
        `Support will contact you about order #${orderId}`,
        { duration: TIMINGS.NOTIFICATION_MEDIUM }
      );
    }

    console.log(`📞 Support contacted for order: ${orderId}`);
  }

  /**
   * Simulate order status progression (for demo)
   * @param {string} orderId - Order ID
   */
  simulateProgress(orderId) {
    const order = this.getOrder(orderId);
    if (!order || order.status === 'delivered') return;

    const currentIndex = this.getCurrentStepIndex(order.status);
    if (currentIndex < this.statusSteps.length - 1) {
      const nextStatus = this.statusSteps[currentIndex + 1].key;
      this.updateOrderStatus(orderId, nextStatus);

      if (window.NotificationSystem) {
        window.NotificationSystem.success(
          `Order status updated: ${this.statusSteps[currentIndex + 1].label}`,
          { duration: TIMINGS.NOTIFICATION_MEDIUM }
        );
      }
    }
  }

  /**
   * Get all active orders (not delivered)
   * @returns {Array} Active orders
   */
  getActiveOrders() {
    const orders = StorageManager.get(this.storageKey, []);
    return orders.filter(o => o.status !== 'delivered');
  }

  /**
   * Get tracking statistics
   * @returns {Object} Stats
   */
  getStats() {
    const orders = StorageManager.get(this.storageKey, []);
    const activeOrders = orders.filter(o => o.status !== 'delivered');

    const statusCounts = {};
    this.statusSteps.forEach(step => {
      statusCounts[step.key] = activeOrders.filter(o => o.status === step.key).length;
    });

    return {
      totalActive: activeOrders.length,
      totalCompleted: orders.filter(o => o.status === 'delivered').length,
      statusCounts
    };
  }
}

// Create global instance
window.OrderTrackingManager = new OrderTrackingManager();

console.log('✅ Order Tracking Manager initialized');
