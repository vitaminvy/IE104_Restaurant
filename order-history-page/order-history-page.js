import i18nService from '../assets/script/i18n-service.js';

(async function () {
  'use strict';

  await i18nService.init();
  document.dispatchEvent(new CustomEvent('language-changed'));

  // Initialize order history page
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('order-history-container');
    const statsContainer = document.getElementById('order-stats');
    const noOrdersMsg = document.getElementById('no-orders-message');
    const searchInput = document.getElementById('order-search');
    const filterBtns = document.querySelectorAll('.history__filter-btn');

    if (!window.OrderHistoryManager) {
      console.error('OrderHistoryManager not loaded');
      return;
    }

    let currentFilter = 'all';
    let currentSearch = '';

    // Render statistics
    function renderStatistics() {
      const stats = window.OrderHistoryManager.getStatistics();

      if (stats.totalOrders === 0) {
        statsContainer.style.display = 'none';
        return;
      }

      statsContainer.innerHTML = `
        <div class="history__stat-card history__stat-card--total-orders animate-scale">
          <div class="history__stat-icon" style="--stat-color: #667eea; --stat-rgb: 102, 126, 234;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div class="history__stat-label">${i18nService.t('order_history_page.stats.total_orders')}</div>
          <div class="history__stat-value">${stats.totalOrders}</div>
        </div>

        <div class="history__stat-card history__stat-card--total-spent animate-scale">
          <div class="history__stat-icon" style="--stat-color: #f093fb; --stat-rgb: 240, 147, 251;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="history__stat-label">${i18nService.t('order_history_page.stats.total_spent')}</div>
          <div class="history__stat-value">$${stats.totalSpent.toFixed(2)}</div>
        </div>

        <div class="history__stat-card history__stat-card--avg-order animate-scale">
          <div class="history__stat-icon" style="--stat-color: #4facfe; --stat-rgb: 79, 172, 254;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              <polyline points="2 12 12 2 22 12"></polyline>
            </svg>
          </div>
          <div class="history__stat-label">${i18nService.t('order_history_page.stats.average_order')}</div>
          <div class="history__stat-value">$${stats.avgOrderValue.toFixed(2)}</div>
        </div>

        <div class="history__stat-card history__stat-card--total-items animate-scale">
          <div class="history__stat-icon" style="--stat-color: #fa709a; --stat-rgb: 250, 112, 154;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <div class="history__stat-label">${i18nService.t('order_history_page.stats.total_items')}</div>
          <div class="history__stat-value">${stats.totalItems}</div>
        </div>
      `;
    }

    // Render orders
    function renderOrders() {
      let orders = window.OrderHistoryManager.getOrders();

      // Apply filters
      if (currentFilter !== 'all') {
        orders = window.OrderHistoryManager.filterByDateRange(currentFilter);
      }

      // Apply search
      if (currentSearch) {
        orders = window.OrderHistoryManager.searchOrders(currentSearch);
      }

      if (orders.length === 0) {
        if (currentSearch || currentFilter !== 'all') {
          container.innerHTML = `
            <div class="no-orders" style="padding: 60px 40px;">
              <div class="no-orders__icon" style="font-size: 80px;">🔍</div>
              <h2 class="no-orders__title" style="font-size: 28px;">${i18nService.t('order_history_page.no_results.title')}</h2>
              <p class="no-orders__text">${i18nService.t('order_history_page.no_results.message')}</p>
            </div>
          `;
        } else {
          noOrdersMsg.style.display = 'block';
          container.innerHTML = '';
        }
        return;
      }

      noOrdersMsg.style.display = 'none';
      container.innerHTML = orders.map(order =>
        window.OrderHistoryManager.createOrderCardElement(order)
      ).join('');
    }

    // Update static HTML elements with translations
    function updateStaticTranslations() {
      // Page header
      const pageTitle = document.querySelector('.history-page__title');
      if (pageTitle) {
        pageTitle.textContent = i18nService.t('order_history_page.title');
      }

      const pageSubtitle = document.querySelector('.history-page__subtitle');
      if (pageSubtitle) {
        pageSubtitle.textContent = i18nService.t('order_history_page.subtitle');
      }

      // Search placeholder
      if (searchInput) {
        searchInput.placeholder = i18nService.t('order_history_page.search.placeholder');
      }

      // Filter buttons
      filterBtns.forEach(btn => {
        const filter = btn.dataset.filter;
        if (filter === 'all') {
          btn.textContent = i18nService.t('order_history_page.filters.all_orders');
        } else if (filter === 'week') {
          btn.textContent = i18nService.t('order_history_page.filters.this_week');
        } else if (filter === 'month') {
          btn.textContent = i18nService.t('order_history_page.filters.this_month');
        } else if (filter === 'year') {
          btn.textContent = i18nService.t('order_history_page.filters.this_year');
        }
      });

      // No orders message
      const noOrdersTitle = noOrdersMsg.querySelector('.no-orders__title');
      if (noOrdersTitle) {
        noOrdersTitle.textContent = i18nService.t('order_history_page.no_orders.title');
      }

      const noOrdersText = noOrdersMsg.querySelector('.no-orders__text');
      if (noOrdersText) {
        noOrdersText.textContent = i18nService.t('order_history_page.no_orders.message');
      }

      const noOrdersBtn = noOrdersMsg.querySelector('.no-orders__btn');
      if (noOrdersBtn) {
        const btnText = noOrdersBtn.querySelector('svg') ?
          noOrdersBtn.childNodes[noOrdersBtn.childNodes.length - 1] :
          noOrdersBtn;
        if (btnText.nodeType === Node.TEXT_NODE) {
          btnText.textContent = i18nService.t('order_history_page.no_orders.browse_menu');
        } else {
          noOrdersBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h18v18H3zM3 9h18M9 21V9"></path>
            </svg>
            ${i18nService.t('order_history_page.no_orders.browse_menu')}
          `;
        }
      }
    }

    // Search functionality
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = e.target.value;
        renderOrders();
      }, 300);
    });

    // Filter functionality
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('history__filter-btn--active'));
        btn.classList.add('history__filter-btn--active');
        currentFilter = btn.dataset.filter;
        renderOrders();
      });
    });

    // Re-render on language change
    document.addEventListener('language-changed', () => {
      updateStaticTranslations();
      renderStatistics();
      renderOrders();
    });

    // Initial render
    updateStaticTranslations();
    renderStatistics();
    renderOrders();

    console.log('✅ Order history page initialized with i18n support');
  });
})();

// Initialize order history page
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('order-history-container');
  const statsContainer = document.getElementById('order-stats');
  const noOrdersMsg = document.getElementById('no-orders-message');
  const searchInput = document.getElementById('order-search');
  const filterBtns = document.querySelectorAll('.history__filter-btn');

  if (!window.OrderHistoryManager) {
    console.error('OrderHistoryManager not loaded');
    return;
  }

  let currentFilter = 'all';
  let currentSearch = '';

  // Render statistics
  function renderStatistics() {
    const stats = window.OrderHistoryManager.getStatistics();

    if (stats.totalOrders === 0) {
      statsContainer.style.display = 'none';
      return;
    }

    statsContainer.innerHTML = `
            <div class="history__stat-card history__stat-card--total-orders animate-scale">
              <div class="history__stat-icon" style="--stat-color: #667eea; --stat-rgb: 102, 126, 234;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div class="history__stat-label">Total Orders</div>
              <div class="history__stat-value">${stats.totalOrders}</div>
            </div>

            <div class="history__stat-card history__stat-card--total-spent animate-scale">
              <div class="history__stat-icon" style="--stat-color: #f093fb; --stat-rgb: 240, 147, 251;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div class="history__stat-label">Total Spent</div>
              <div class="history__stat-value">$${stats.totalSpent.toFixed(2)}</div>
            </div>

            <div class="history__stat-card history__stat-card--avg-order animate-scale">
              <div class="history__stat-icon" style="--stat-color: #4facfe; --stat-rgb: 79, 172, 254;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  <polyline points="2 12 12 2 22 12"></polyline>
                </svg>
              </div>
              <div class="history__stat-label">Average Order</div>
              <div class="history__stat-value">$${stats.avgOrderValue.toFixed(2)}</div>
            </div>

            <div class="history__stat-card history__stat-card--total-items animate-scale">
              <div class="history__stat-icon" style="--stat-color: #fa709a; --stat-rgb: 250, 112, 154;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div class="history__stat-label">Total Items</div>
              <div class="history__stat-value">${stats.totalItems}</div>
            </div>
          `;
  }

  // Render orders
  function renderOrders() {
    let orders = window.OrderHistoryManager.getOrders();

    // Apply filters
    if (currentFilter !== 'all') {
      orders = window.OrderHistoryManager.filterByDateRange(currentFilter);
    }

    // Apply search
    if (currentSearch) {
      orders = window.OrderHistoryManager.searchOrders(currentSearch);
    }

    if (orders.length === 0) {
      if (currentSearch || currentFilter !== 'all') {
        container.innerHTML = `
                <div class="no-orders" style="padding: 60px 40px;">
                  <div class="no-orders__icon" style="font-size: 80px;">🔍</div>
                  <h2 class="no-orders__title" style="font-size: 28px;">No Orders Found</h2>
                  <p class="no-orders__text">Try adjusting your search or filters</p>
                </div>
              `;
      } else {
        noOrdersMsg.style.display = 'block';
        container.innerHTML = '';
      }
      return;
    }

    noOrdersMsg.style.display = 'none';
    container.innerHTML = orders.map(order =>
      window.OrderHistoryManager.createOrderCardElement(order)
    ).join('');
  }

  // Search functionality
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value;
      renderOrders();
    }, 300);
  });

  // Filter functionality
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('history__filter-btn--active'));
      btn.classList.add('history__filter-btn--active');
      currentFilter = btn.dataset.filter;
      renderOrders();
    });
  });

  // Initial render
  renderStatistics();
  renderOrders();

  console.log('✅ Order history page initialized');
});