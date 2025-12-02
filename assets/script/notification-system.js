// ================================
// GLOBAL NOTIFICATION SYSTEM
// Unified success/error/info messages
// ================================

(function () {
  'use strict';

  // ================================
  // CONFIGURATION
  // ================================

  const config = {
    duration: 3000, // Auto-dismiss after 3 seconds
    maxNotifications: 5, // Maximum stacked notifications
    position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center
    progressBar: true, // Show countdown progress bar
    closeButton: true, // Show close button
    pauseOnHover: true, // Pause auto-dismiss on hover
    animationDuration: 300, // Animation duration in ms
  };

  // ================================
  // STATE
  // ================================

  let container = null;
  let notifications = [];
  let notificationId = 0;

  // ================================
  // INITIALIZATION
  // ================================

  function init() {
    if (container) return;

    // Create container
    container = document.createElement('div');
    container.className = `notification-container notification-container--${config.position}`;
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notifications');
    container.setAttribute('aria-live', 'polite');

    document.body.appendChild(container);
  }

  // ================================
  // CREATE NOTIFICATION
  // ================================

  function createNotification(message, type = 'info', options = {}) {
    init();

    // Merge options with defaults
    const opts = {
      duration: options.duration || config.duration,
      progressBar: options.progressBar !== undefined ? options.progressBar : config.progressBar,
      closeButton: options.closeButton !== undefined ? options.closeButton : config.closeButton,
      pauseOnHover: options.pauseOnHover !== undefined ? options.pauseOnHover : config.pauseOnHover,
      onClick: options.onClick || null,
      onClose: options.onClose || null,
    };

    // Check max notifications
    if (notifications.length >= config.maxNotifications) {
      removeNotification(notifications[0]);
    }

    // Create notification object
    const notification = {
      id: ++notificationId,
      message,
      type,
      options: opts,
      element: null,
      timer: null,
      progressInterval: null,
      isPaused: false,
      timeRemaining: opts.duration,
    };

    // Create DOM element
    notification.element = createNotificationElement(notification);

    // Add to container
    container.appendChild(notification.element);
    notifications.push(notification);

    // Trigger entrance animation
    setTimeout(() => {
      notification.element.classList.add('show');
    }, 10);

    // Start auto-dismiss timer
    if (opts.duration > 0) {
      startTimer(notification);
    }

    return notification;
  }

  // ================================
  // CREATE NOTIFICATION ELEMENT
  // ================================

  function createNotificationElement(notification) {
    const { message, type, options } = notification;

    const el = document.createElement('div');
    el.className = `notification notification--${type}`;
    el.setAttribute('role', 'alert');

    // Icon
    const icon = getIcon(type);

    // Close button
    const closeBtn = options.closeButton
      ? `<button class="notification__close" aria-label="Close notification">
           <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
             <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
           </svg>
         </button>`
      : '';

    // Progress bar
    const progressBar = options.progressBar
      ? `<div class="notification__progress">
           <div class="notification__progress-bar"></div>
         </div>`
      : '';

    el.innerHTML = `
      <div class="notification__icon">${icon}</div>
      <div class="notification__content">
        <div class="notification__message">${message}</div>
      </div>
      ${closeBtn}
      ${progressBar}
    `;

    // Event listeners
    if (options.closeButton) {
      el.querySelector('.notification__close').addEventListener('click', () => {
        removeNotification(notification);
      });
    }

    if (options.onClick) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        if (!e.target.closest('.notification__close')) {
          options.onClick(notification);
        }
      });
    }

    if (options.pauseOnHover) {
      el.addEventListener('mouseenter', () => pauseNotification(notification));
      el.addEventListener('mouseleave', () => resumeNotification(notification));
    }

    return el;
  }

  // ================================
  // ICONS
  // ================================

  function getIcon(type) {
    const icons = {
      success: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
      error: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
      warning: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 20h20L12 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M12 10v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
      info: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16v-4m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
    };

    return icons[type] || icons.info;
  }

  // ================================
  // TIMER MANAGEMENT
  // ================================

  function startTimer(notification) {
    const { options, element } = notification;
    const startTime = Date.now();

    notification.timer = setTimeout(() => {
      removeNotification(notification);
    }, options.duration);

    // Progress bar animation
    if (options.progressBar) {
      const progressBar = element.querySelector('.notification__progress-bar');
      if (progressBar) {
        progressBar.style.transition = `width ${options.duration}ms linear`;
        progressBar.style.width = '0%';
      }
    }
  }

  function pauseNotification(notification) {
    if (notification.isPaused) return;

    notification.isPaused = true;

    if (notification.timer) {
      clearTimeout(notification.timer);
    }

    // Pause progress bar
    if (notification.options.progressBar) {
      const progressBar = notification.element.querySelector('.notification__progress-bar');
      if (progressBar) {
        const computedStyle = window.getComputedStyle(progressBar);
        const currentWidth = computedStyle.width;
        progressBar.style.width = currentWidth;
        progressBar.style.transition = 'none';
      }
    }
  }

  function resumeNotification(notification) {
    if (!notification.isPaused) return;

    notification.isPaused = false;

    // Resume progress bar
    if (notification.options.progressBar) {
      const progressBar = notification.element.querySelector('.notification__progress-bar');
      if (progressBar) {
        const currentWidth = parseFloat(progressBar.style.width);
        const remainingDuration = (100 - currentWidth) / 100 * notification.options.duration;

        progressBar.style.transition = `width ${remainingDuration}ms linear`;
        progressBar.style.width = '0%';

        notification.timer = setTimeout(() => {
          removeNotification(notification);
        }, remainingDuration);
      }
    } else {
      notification.timer = setTimeout(() => {
        removeNotification(notification);
      }, notification.timeRemaining);
    }
  }

  // ================================
  // REMOVE NOTIFICATION
  // ================================

  function removeNotification(notification) {
    if (!notification || !notification.element) return;

    // Clear timers
    if (notification.timer) {
      clearTimeout(notification.timer);
    }

    if (notification.progressInterval) {
      clearInterval(notification.progressInterval);
    }

    // Trigger exit animation
    notification.element.classList.remove('show');
    notification.element.classList.add('hide');

    // Remove from DOM after animation
    setTimeout(() => {
      if (notification.element && notification.element.parentElement) {
        notification.element.remove();
      }

      // Remove from array
      const index = notifications.indexOf(notification);
      if (index > -1) {
        notifications.splice(index, 1);
      }

      // Call onClose callback
      if (notification.options.onClose) {
        notification.options.onClose(notification);
      }

      // Remove container if empty
      if (notifications.length === 0 && container) {
        container.remove();
        container = null;
      }
    }, config.animationDuration);
  }

  // ================================
  // PUBLIC API
  // ================================

  window.NotificationSystem = {
    success: (message, options) => createNotification(message, 'success', options),
    error: (message, options) => createNotification(message, 'error', options),
    warning: (message, options) => createNotification(message, 'warning', options),
    info: (message, options) => createNotification(message, 'info', options),
    remove: removeNotification,
    removeAll: () => {
      [...notifications].forEach(removeNotification);
    },
    configure: (options) => {
      Object.assign(config, options);
    },
  };

  // Legacy compatibility with existing toast systems
  window.showNotification = (message, type = 'info', duration = 3000) => {
    return createNotification(message, type, { duration });
  };
})();
