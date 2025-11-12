/* ========================================
 * SOCIAL PROOF NOTIFICATION SYSTEM
 * ======================================== */

import { enhancedMenuItems } from "../data/menu-enhanced.js";

/* ========================================
 * SOCIAL PROOF COMPONENT
 * ======================================== */

(function () {
  // CONFIGURATION
  const CONFIG = {
    notificationInterval: 8000, // Show notification every 8 seconds
    notificationDuration: 5000, // Keep notification visible for 5 seconds
    minOrders: 87, // Starting count for orders today
    maxOrders: 215, // Max count for orders today
  };

  // SAMPLE CUSTOMER NAMES
  const CUSTOMER_NAMES = [
    "Sarah",
    "Michael",
    "Emma",
    "James",
    "Olivia",
    "William",
    "Ava",
    "Lucas",
    "Sophia",
    "Benjamin",
    "Isabella",
    "Mason",
    "Mia",
    "Ethan",
    "Charlotte",
    "Alexander",
    "Amelia",
    "Daniel",
    "Harper",
    "Matthew",
  ];

  // SAMPLE LOCATIONS
  const LOCATIONS = [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Canberra",
    "Hobart",
    "Darwin",
    "Gold Coast",
    "Newcastle",
  ];

  // STATE
  let orderCount = CONFIG.minOrders;
  let notificationTimeout = null;
  let hideTimeout = null;
  let currentNotification = null;

  /* ========================================
   * CREATE NOTIFICATION ELEMENT
   * ======================================== */

  function createNotification() {
    const notification = document.createElement("div");
    notification.className = "social-proof-notification";
    notification.setAttribute("role", "status");
    notification.setAttribute("aria-live", "polite");

    // Image wrapper
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "social-proof-notification__image";

    const img = document.createElement("img");
    img.className = "social-proof-notification__img";
    img.alt = "Food item";
    imageWrapper.appendChild(img);

    // Content
    const content = document.createElement("div");
    content.className = "social-proof-notification__content";

    const name = document.createElement("p");
    name.className = "social-proof-notification__name";

    const action = document.createElement("p");
    action.className = "social-proof-notification__action";

    content.appendChild(name);
    content.appendChild(action);

    // Icon
    const icon = document.createElement("span");
    icon.className = "social-proof-notification__icon";
    icon.textContent = "🎉";

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "social-proof-notification__close";
    closeBtn.innerHTML = "×";
    closeBtn.setAttribute("aria-label", "Close notification");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      hideNotification();
    });

    // Assemble
    notification.appendChild(imageWrapper);
    notification.appendChild(content);
    notification.appendChild(icon);
    notification.appendChild(closeBtn);

    // Click to dismiss
    notification.addEventListener("click", hideNotification);

    document.body.appendChild(notification);
    return notification;
  }

  /* ========================================
   * CREATE ORDER COUNTER
   * ======================================== */

  function createOrderCounter() {
    const counter = document.createElement("div");
    counter.className = "social-proof-counter";
    counter.id = "socialProofCounter";

    const icon = document.createElement("span");
    icon.className = "social-proof-counter__icon";
    icon.textContent = "🔥";

    const text = document.createElement("span");
    text.innerHTML = `<span class="social-proof-counter__number">${orderCount}</span> meals delivered today`;

    counter.appendChild(icon);
    counter.appendChild(text);

    document.body.appendChild(counter);
    return counter;
  }

  /* ========================================
   * GENERATE RANDOM ORDER DATA
   * ======================================== */

  function generateRandomOrder() {
    // Random customer name and location
    const customerName =
      CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    const location =
      LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    // Random menu item
    const item =
      enhancedMenuItems[
        Math.floor(Math.random() * enhancedMenuItems.length)
      ];

    // Random time (1-30 minutes ago)
    const minutesAgo = Math.floor(Math.random() * 30) + 1;
    const timeText =
      minutesAgo === 1
        ? "just now"
        : minutesAgo < 5
        ? "a few minutes ago"
        : `${minutesAgo} minutes ago`;

    return {
      customerName,
      location,
      item,
      timeText,
    };
  }

  /* ========================================
   * SHOW NOTIFICATION
   * ======================================== */

  function showNotification() {
    // Generate random order
    const order = generateRandomOrder();

    // Get or create notification element
    if (!currentNotification) {
      currentNotification = createNotification();
    }

    // Update notification content
    const img = currentNotification.querySelector(
      ".social-proof-notification__img"
    );
    const name = currentNotification.querySelector(
      ".social-proof-notification__name"
    );
    const action = currentNotification.querySelector(
      ".social-proof-notification__action"
    );

    img.src = order.item.image;
    img.alt = order.item.title;

    name.textContent = `${order.customerName} from ${order.location}`;

    action.innerHTML = `
      just ordered <span class="social-proof-notification__item">${order.item.title}</span>
      <span class="social-proof-notification__time">${order.timeText}</span>
    `;

    // Show notification
    setTimeout(() => {
      currentNotification.classList.add("social-proof-notification--visible");
    }, 100);

    // Increment order count
    incrementOrderCount();

    // Auto-hide after duration
    hideTimeout = setTimeout(hideNotification, CONFIG.notificationDuration);
  }

  /* ========================================
   * HIDE NOTIFICATION
   * ======================================== */

  function hideNotification() {
    if (!currentNotification) return;

    currentNotification.classList.remove("social-proof-notification--visible");

    // Clear auto-hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  /* ========================================
   * INCREMENT ORDER COUNT
   * ======================================== */

  function incrementOrderCount() {
    // Increment count (with max limit)
    if (orderCount < CONFIG.maxOrders) {
      orderCount++;

      // Update counter display
      const counter = document.getElementById("socialProofCounter");
      if (counter) {
        const numberSpan = counter.querySelector(".social-proof-counter__number");
        if (numberSpan) {
          // Animate number change
          numberSpan.style.transform = "scale(1.2)";
          numberSpan.style.color = "#ffffff";
          numberSpan.textContent = orderCount;

          setTimeout(() => {
            numberSpan.style.transform = "scale(1)";
            numberSpan.style.color = "";
          }, 300);
        }
      }
    }
  }

  /* ========================================
   * START NOTIFICATION CYCLE
   * ======================================== */

  function startNotificationCycle() {
    // Show first notification after delay
    notificationTimeout = setTimeout(() => {
      showNotification();

      // Continue showing notifications at intervals
      notificationTimeout = setInterval(() => {
        showNotification();
      }, CONFIG.notificationInterval);
    }, 3000); // Wait 3 seconds before first notification
  }

  /* ========================================
   * STOP NOTIFICATION CYCLE
   * ======================================== */

  function stopNotificationCycle() {
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      clearInterval(notificationTimeout);
      notificationTimeout = null;
    }

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  /* ========================================
   * HANDLE VISIBILITY CHANGE
   * ======================================== */

  function handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause notifications
      stopNotificationCycle();
      hideNotification();
    } else {
      // Page is visible, resume notifications
      startNotificationCycle();
    }
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  function init() {
    // Randomize initial order count
    orderCount =
      Math.floor(
        Math.random() * (CONFIG.maxOrders - CONFIG.minOrders + 1)
      ) + CONFIG.minOrders;

    // Create order counter
    createOrderCounter();

    // Start notification cycle
    startNotificationCycle();

    // Pause notifications when page is hidden
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up on page unload
    window.addEventListener("beforeunload", stopNotificationCycle);
  }

  /* ========================================
   * AUTO-INITIALIZE
   * ======================================== */

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
