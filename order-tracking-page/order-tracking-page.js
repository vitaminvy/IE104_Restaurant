import i18nService from '../assets/script/i18n-service.js';

(async function () {
  'use strict';

  await i18nService.init();
  document.dispatchEvent(new CustomEvent('language-changed'));

  // Initialize order tracking page
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('order-tracker-container');
    const noOrdersMsg = document.getElementById('no-orders-message');

    function renderTrackers() {
      // Get active orders
      const orders = StorageManager.get(STORAGE_KEYS.ORDER_HISTORY, []);
      const activeOrders = orders.filter(order => order.status !== 'delivered');

      if (activeOrders.length === 0) {
        noOrdersMsg.style.display = 'block';
        container.innerHTML = '';
        return;
      }

      noOrdersMsg.style.display = 'none';

      // Render each order tracker
      container.innerHTML = '';
      activeOrders.forEach(order => {
        if (window.OrderTrackingManager) {
          const trackerHTML = window.OrderTrackingManager.createTrackerElement(order.id);
          container.innerHTML += trackerHTML;
        }
      });
    }

    // Update static HTML elements with translations
    function updateStaticTranslations() {
      // Page header
      const pageTitle = document.querySelector('.tracking-page__title');
      if (pageTitle) {
        pageTitle.textContent = i18nService.t('order_tracking_page.title');
      }

      const pageSubtitle = document.querySelector('.tracking-page__subtitle');
      if (pageSubtitle) {
        pageSubtitle.textContent = i18nService.t('order_tracking_page.subtitle');
      }

      // No orders message
      const noOrdersTitle = noOrdersMsg.querySelector('.no-orders__title');
      if (noOrdersTitle) {
        noOrdersTitle.textContent = i18nService.t('order_tracking_page.no_orders.title');
      }

      const noOrdersText = noOrdersMsg.querySelector('.no-orders__text');
      if (noOrdersText) {
        noOrdersText.textContent = i18nService.t('order_tracking_page.no_orders.message');
      }

      const noOrdersBtn = noOrdersMsg.querySelector('.no-orders__btn');
      if (noOrdersBtn) {
        const btnText = noOrdersBtn.querySelector('svg') ?
          noOrdersBtn.childNodes[noOrdersBtn.childNodes.length - 1] :
          noOrdersBtn;
        if (btnText.nodeType === Node.TEXT_NODE) {
          btnText.textContent = i18nService.t('order_tracking_page.no_orders.browse_menu');
        } else {
          noOrdersBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h18v18H3zM3 9h18M9 21V9"></path>
            </svg>
            ${i18nService.t('order_tracking_page.no_orders.browse_menu')}
          `;
        }
      }
    }

    // Re-render on language change
    document.addEventListener('language-changed', () => {
      updateStaticTranslations();
      renderTrackers();
    });

    // Initial render
    updateStaticTranslations();
    renderTrackers();

    console.log('✅ Order tracking page initialized with i18n support');
  });
})();

// Initialize order tracking page
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('order-tracker-container');
  const noOrdersMsg = document.getElementById('no-orders-message');

  // Get active orders
  const orders = StorageManager.get(STORAGE_KEYS.ORDER_HISTORY, []);
  const activeOrders = orders.filter(order => order.status !== 'delivered');

  if (activeOrders.length === 0) {
    noOrdersMsg.style.display = 'block';
    return;
  }

  // Render each order tracker
  activeOrders.forEach(order => {
    if (window.OrderTrackingManager) {
      const trackerHTML = window.OrderTrackingManager.createTrackerElement(order.id);
      container.innerHTML += trackerHTML;
    }
  });

  console.log('✅ Order tracking page initialized');
});