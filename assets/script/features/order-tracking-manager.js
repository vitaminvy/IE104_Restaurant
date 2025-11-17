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
    if (window.EventBus && typeof window.EventBus.emit === 'function') {
      window.EventBus.emit(EVENT_NAMES.ORDER_STATUS_UPDATED, {
        orderId,
        status: newStatus
      });
    }

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
          <div class="tracker__actions">
            ${order.status !== 'delivered' ? `
              <button class="tracker__contact-btn" onclick="window.OrderTrackingManager.contactSupport('${order.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Contact Support
              </button>
              <button class="tracker__update-btn" onclick="window.OrderTrackingManager.simulateProgress('${order.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Update Status
              </button>
            ` : `
              <button class="tracker__reorder-btn" onclick="window.OrderHistoryManager && window.OrderHistoryManager.reorderWithConfirmation('${order.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Reorder
              </button>
            `}
          </div>
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

    this.showContactSupportModal(order);
  }

  /**
   * Show professional contact support modal
   * @param {Object} order - Order object
   */
  showContactSupportModal(order) {
    const modalHTML = `
      <div class="order-modal-overlay active" id="contact-support-modal">
        <div class="order-modal" style="max-width: 600px; animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <div class="order-modal__header">
            <div class="order-modal__title-section">
              <h2 class="order-modal__title">Contact Support</h2>
              <p style="font-size: 14px; color: rgba(255, 255, 255, 0.6); margin-top: 4px;">
                How can we help you with Order #${order.id}?
              </p>
            </div>
            <button class="order-modal__close" id="close-support-modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="order-modal__body">
            <form id="support-form" class="support-form">
              <!-- Order Info -->
              <div class="support-form__order-info">
                <div class="support-form__info-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  <span>Order #${order.id}</span>
                </div>
                <div class="support-form__info-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Status: ${(order.status || 'placed').replace(/-/g, ' ')}</span>
                </div>
              </div>

              <!-- Issue Category -->
              <div class="support-form__group">
                <label class="support-form__label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Issue Category *
                </label>
                <select class="support-form__select" id="issue-category" required>
                  <option value="">Select an issue...</option>
                  <option value="delivery-delay">Delivery Delay</option>
                  <option value="order-issue">Order Issue</option>
                  <option value="missing-items">Missing Items</option>
                  <option value="wrong-order">Wrong Order</option>
                  <option value="quality-concern">Quality Concern</option>
                  <option value="payment-issue">Payment Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Contact Method -->
              <div class="support-form__group">
                <label class="support-form__label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Preferred Contact Method *
                </label>
                <div class="support-form__radio-group">
                  <label class="support-form__radio color: #fff">
                    <input type="radio" name="contact-method" value="phone" required>
                    <span>Phone Call</span>
                  </label>
                  <label class="support-form__radio">
                    <input type="radio" name="contact-method" value="email" required>
                    <span>Email</span>
                  </label>
                  <label class="support-form__radio">
                    <input type="radio" name="contact-method" value="sms" required>
                    <span>SMS</span>
                  </label>
                </div>
              </div>

              <!-- Contact Info -->
              <div class="support-form__group">
                <label class="support-form__label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Email Address *
                </label>
                <input
                  type="email"
                  class="support-form__input"
                  id="contact-email"
                  value="${order.deliveryAddress?.email || ''}"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div class="support-form__group">
                <label class="support-form__label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  class="support-form__input"
                  id="contact-phone"
                  value="${order.deliveryAddress?.phone || ''}"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>

              <!-- Message -->
              <div class="support-form__group">
                <label class="support-form__label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  Describe Your Issue *
                </label>
                <textarea
                  class="support-form__textarea"
                  id="issue-message"
                  rows="4"
                  placeholder="Please provide details about your issue..."
                  required
                ></textarea>
                <div class="support-form__hint">
                  Our support team will respond within 24 hours
                </div>
              </div>
            </form>
          </div>
          <div class="order-modal__footer">
            <button type="button" class="order-modal__btn order-modal__btn--secondary" id="cancel-support-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Cancel
            </button>
            <button type="button" class="order-modal__btn order-modal__btn--primary" id="submit-support-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
              Submit Request
            </button>
          </div>
        </div>
      </div>
    `;

    // Add styles
    if (!document.getElementById('support-form-styles')) {
      const styles = document.createElement('style');
      styles.id = 'support-form-styles';
      styles.textContent = `
        .support-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .support-form__order-info {
          display: flex;
          gap: 24px;
          padding: 16px;
          background: rgba(251, 143, 44, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(251, 143, 44, 0.2);
        }

        .support-form__info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
        }

        .support-form__info-item svg {
          color: var(--color-dark-orange, #fb8f2c);
        }

        .support-form__group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .support-form__label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }

        .support-form__label svg {
          color: var(--color-dark-orange, #fb8f2c);
        }

        /* INPUT, SELECT, TEXTAREA BASE STYLE */
        .support-form__input,
        .support-form__select,
        .support-form__textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-family: var(--font-body, 'Plus Jakarta Sans');
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        /* FOCUS STYLE */
        .support-form__input:focus,
        .support-form__select:focus,
        .support-form__textarea:focus {
          outline: none;
          border-color: var(--color-dark-orange, #fb8f2c);
          background: rgba(255, 255, 255, 0.08);
        }

        /* SELECT DROPDOWN FIX */
        .support-form__select {
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }

        /* OPTION STYLE (dropdown item) */
        .support-form__select option {
          font-size: 14px;
          color: #000;
        }

        .support-form__textarea {
          resize: vertical;
          min-height: 100px;
        }

        .support-form__radio-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .support-form__radio {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .support-form__radio:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(251, 143, 44, 0.3);
        }

        .support-form__radio input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .support-form__radio input[type="radio"]:checked + span {
          color: var(--color-dark-orange, #fb8f2c);
          font-weight: 600;
        }

        .support-form__hint {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .support-form__order-info {
            flex-direction: column;
            gap: 12px;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    // Remove existing modal
    const existingModal = document.getElementById('contact-support-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get elements
    const modal = document.getElementById('contact-support-modal');
    const closeBtn = document.getElementById('close-support-modal');
    const cancelBtn = document.getElementById('cancel-support-btn');
    const submitBtn = document.getElementById('submit-support-btn');
    const form = document.getElementById('support-form');

    // Close modal function
    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
      }, 300);
    };

    // Event listeners
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Submit support request
    submitBtn.addEventListener('click', () => {
      // Validate form
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = {
        orderId: order.id,
        category: document.getElementById('issue-category').value,
        contactMethod: document.querySelector('input[name="contact-method"]:checked')?.value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        message: document.getElementById('issue-message').value,
        timestamp: Date.now()
      };

      // Here you would normally send this to a backend API
      console.log('📧 Support request submitted:', formData);

      // Show success notification
      if (window.NotificationSystem) {
        window.NotificationSystem.success(
          'Support request submitted successfully! We\'ll contact you soon.',
          { duration: TIMINGS.NOTIFICATION_LONG }
        );
      }

      closeModal();
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // ESC key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    console.log('📞 Contact support modal opened for order:', order.id);
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
          { duration: TIMINGS.NOTIFICATION_SHORT }
        );
      }

      // Reload the page after a short delay to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
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
