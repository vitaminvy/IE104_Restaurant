import { initPagination } from './pagination.js';
import { menuItems } from '../assets/data/mockdata.js';
import i18nService from '../assets/script/i18n-service.js';

(function () {
  const container = document.getElementById('menu-card-container');
  const tabs = document.querySelectorAll('.menu__filter-item');

  let currentCategory =
    document.querySelector('.menu__filter-item--active')?.dataset.category ||
    'breakfast';
  let currentPage = 1;
  const itemsPerPage = 8; 

  const formatPrice = (p) =>
    p.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (!cartCountEl) return;

    try {
      const cartData = localStorage.getItem('restaurantCart');
      const cart = cartData ? JSON.parse(cartData) : [];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCountEl.textContent = totalItems;
    } catch (e) {
      console.error('Error reading cart for count update:', e);
      cartCountEl.textContent = '0';
    }
  }

  function setupFloatingCartIcon() {
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
      cartIcon.addEventListener('click', () => {
        window.location.href = '/cartpage/cart.html';
      });
    }
  }

  const cardTemplate = (item) => {
    const title = i18nService.t(item.title);
    const desc = i18nService.t(item.desc);
    return `
    <article class="menu__card" data-item-id="${item.id}" data-item-title="${title}" data-item-price="${item.price}" data-item-image="${item.image}" data-item-desc="${desc || ''}">
      <div class="menu__card-img-wrapper">
        <img src="${item.image}" alt="${title}" class="menu__card-image" loading="lazy"/>
      </div>
      <div class="menu__card-content">
        <h3 class="menu__card-title">${title}</h3>
        <p class="menu__card-desc">${desc}</p>
        <div class="menu__card-meta">
          <span class="menu__card-price">${formatPrice(item.price)}</span>
          <div class="menu__card-actions">
            <button class="menu__card-cart-btn" data-item-id="${item.id}" aria-label="${i18nService.t("menu_page.add_to_cart_aria_label")}" title="${i18nService.t("menu_page.add_to_cart_title")}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </button>
            <button class="menu__card-btn btn" data-item-id="${item.id}">${i18nService.t("menu_page.order_now_button")}</button>
          </div>
        </div>
        <!-- Dropdown menu (hidden by default) -->
        <div class="menu__card-dropdown" style="display: none;">
          <button class="menu__card-dropdown-item view-details" data-item-id="${item.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View Details
          </button>
          <button class="menu__card-dropdown-item add-to-favorites" data-item-id="${item.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            Add to Favorites
          </button>
          <button class="menu__card-dropdown-item share-item" data-item-id="${item.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
        </div>
      </div>
    </article>`;
  }

  function getFilteredData() {
    return currentCategory === 'all'
      ? menuItems
      : menuItems.filter((x) => x.category === currentCategory);
  }

  function render() {
    const data = getFilteredData();
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = data.slice(start, end);

    container.innerHTML = pageData.map(cardTemplate).join('');

    // Initialize pagination
    initPagination(totalPages, currentPage, (page) => {
      currentPage = page;
      render();
      window.scrollTo({ top: container.offsetTop - 160, behavior: 'smooth' });
    });

    // Setup Order Now button handlers
    setupOrderButtonHandlers();

    // Setup menu icon handlers
    setupMenuIconHandlers();

    // Setup cart icon handlers
    setupCartIconHandlers();
  }

  // Setup Order Now button click handlers
  function setupOrderButtonHandlers() {
    const orderButtons = container.querySelectorAll('.menu__card-btn');

    orderButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = e.target.closest('.menu__card');
        if (!card) return;

        const itemId = Number(card.dataset.itemId);
        const item = menuItems.find((i) => i.id === itemId);
        if (!item) return;

        // Get title and desc from the DOM to avoid race condition
        const title = card.querySelector('.menu__card-title')?.textContent || i18nService.t(item.title);
        const desc = card.querySelector('.menu__card-desc')?.textContent || i18nService.t(item.desc);

        const cartItem = { ...item, title, desc };
        addToCartAndNavigate(cartItem);
      });
    });
  }

  // Add to cart and navigate
  function addToCartAndNavigate(item) {
    console.log('🛒 Adding to cart:', item.title);

    // Show loader
    if (window.GlobalLoader) {
      window.GlobalLoader.show('Adding to cart...');
    }

    // Get existing cart from localStorage
    let cart = [];
    try {
      const cartData = localStorage.getItem('restaurantCart');
      if (cartData) {
        cart = JSON.parse(cartData);
      }
    } catch (e) {
      console.error('Error reading cart:', e);
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex > -1) {
      // Item exists, increase quantity
      cart[existingItemIndex].quantity =
        (cart[existingItemIndex].quantity || 1) + 1;
    } else {
      // Add new item to cart
      const cartItem = {
        id: item.id,
        title: item.title, // Already translated from DOM
        price: item.price,
        image: item.image,
        desc: item.desc || '', // Already translated from DOM
        quantity: 1,
      };
      cart.push(cartItem);
    }

    // Save to localStorage
    try {
      localStorage.setItem('restaurantCart', JSON.stringify(cart));
    } catch (e) {
      console.error('❌ Error saving cart:', e);
    }

    // Update loader message
    if (window.GlobalLoader) {
      window.GlobalLoader.updateMessage('Redirecting to cart...');
    }

    // Navigate to cart page
    setTimeout(() => {
      window.location.href = '/cartpage/cart.html';
    }, 500);
  }

  // Setup menu icon dropdown handlers
  function setupMenuIconHandlers() {
    // This function is not implemented in the original code
  }

  // Setup cart icon button handlers
  function setupCartIconHandlers() {
    const cartButtons = container.querySelectorAll('.menu__card-cart-btn');

    cartButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = e.target.closest('.menu__card');
        if (!card) return;

        const itemId = Number(card.dataset.itemId);
        const item = menuItems.find((i) => i.id === itemId);
        if (!item) return;

        // Get title and desc from the DOM to avoid race condition
        const title = card.querySelector('.menu__card-title')?.textContent || i18nService.t(item.title);
        const desc = card.querySelector('.menu__card-desc')?.textContent || i18nService.t(item.desc);

        console.log('🛒 Adding to cart via cart icon:', title);

        // Add animation to button
        button.style.transform = 'scale(0.85)';
        setTimeout(() => {
          button.style.transform = '';
        }, 200);

        // Get existing cart from localStorage
        let cart = [];
        try {
          const cartData = localStorage.getItem('restaurantCart');
          if (cartData) {
            cart = JSON.parse(cartData);
          }
        } catch (e) {
          console.error('Error reading cart:', e);
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(
          (cartItem) => cartItem.id === item.id
        );

        if (existingItemIndex > -1) {
          // Item exists, increase quantity
          cart[existingItemIndex].quantity =
            (cart[existingItemIndex].quantity || 1) + 1;
        } else {
          // Add new item to cart
          const cartItem = {
            id: item.id,
            title: title, // Already translated from DOM
            price: item.price,
            image: item.image,
            desc: desc || '', // Already translated from DOM
            quantity: 1,
          };
          cart.push(cartItem);
        }

        // Save to localStorage
        try {
          localStorage.setItem('restaurantCart', JSON.stringify(cart));
        } catch (e) {
          console.error('❌ Error saving cart:', e);
        }

        // Show toast notification
        if (window.showToast) {
          const totalQty = cart.find(i => i.id === item.id)?.quantity || 1;
          window.showToast(
            `${title} added to cart (Qty: ${totalQty})`,
            'success',
            2000
          );
        }

        // Update cart count in header
        updateCartCount();
      });
    });
  }

  tabs.forEach((t) =>
    t.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach((x) => x.classList.remove('menu__filter-item--active'));
      t.classList.add('menu__filter-item--active');
      currentCategory = t.dataset.category || 'breakfast';
      currentPage = 1;
      render();
    })
  );

  // Initial render and re-render on language change
  document.addEventListener('language-changed', render);

  // Initialize translations and then render
  (async () => {
    await i18nService.init();
    render();
    updateCartCount();
    setupFloatingCartIcon();
  })();
})();

// Other IIFEs can remain as they are
(function rippleOnClick() {
  const root = document.getElementById('menu-card-container');
  if (!root) return;
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu__card-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = e.clientX - rect.left - size / 2 + 'px';
    r.style.top = e.clientY - rect.top - size / 2 + 'px';
    btn.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
})();

(function setupToast() {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    document.body.appendChild(root);
  }
  window.showToast = function (message, type = 'success', duration = 1800) {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    const msg = document.createElement('span');
    msg.textContent = message;
    const close = document.createElement('span');
    close.className = 'toast__close';
    close.setAttribute('role', 'button');
    close.setAttribute('aria-label', 'Close');
    close.textContent = '×';
    close.onclick = () => dismiss();
    el.appendChild(close);
    el.appendChild(msg);
    root.appendChild(el);

    requestAnimationFrame(() => el.classList.add('is-visible'));

    const t = setTimeout(dismiss, duration);
    function dismiss() {
      clearTimeout(t);
      el.classList.remove("is-visible");
      el.addEventListener("transitionend", () => el.remove(), { once: true });
    }
  };
})();

(function setupCardRouting() {
  const container = document.getElementById("menu-card-container");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const isOrderButton = e.target.closest(".menu__card-btn");
    if (isOrderButton) return;

    const card = e.target.closest(".menu__card");
    if (!card) return;

    const itemId = card.dataset.itemId;
    if (!itemId) return;

    if (window.GlobalLoader) {
      window.GlobalLoader.show('Loading product...');
    }

    setTimeout(() => {
      window.location.href = `../product-detail-page/index.html?id=${itemId}`;
    }, 200);
  });
})();