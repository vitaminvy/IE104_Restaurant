import { initPagination } from './pagination.js';
import { menuItems } from '../assets/data/mockdata.js';

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

  const cardTemplate = (item) => `
    <article class="menu__card" data-item-id="${item.id}" data-item-title="${
    item.title
  }" data-item-price="${item.price}" data-item-image="${
    item.image
  }" data-item-desc="${item.desc || ''}">
      <div class="menu__card-img-wrapper">
        <img src="${item.image}" alt="${
    item.title
  }" class="menu__card-image" loading="lazy"/>
      </div>
      <div class="menu__card-content">
        <h3 class="menu__card-title">${item.title}</h3>
        <p class="menu__card-desc">${item.desc}</p>
        <div class="menu__card-meta">
          <span class="menu__card-price">${formatPrice(item.price)}</span>
          <div class="menu__card-actions">
            <button class="menu__card-cart-btn" data-item-id="${
              item.id
            }" aria-label="Add to cart" title="Add to cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </button>
            <button class="menu__card-btn btn" data-item-id="${
              item.id
            }">Order Now +</button>
          </div>
        </div>
        <!-- Dropdown menu (hidden by default) -->
        <div class="menu__card-dropdown" style="display: none;">
          <button class="menu__card-dropdown-item view-details" data-item-id="${
            item.id
          }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View Details
          </button>
          <button class="menu__card-dropdown-item add-to-favorites" data-item-id="${
            item.id
          }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            Add to Favorites
          </button>
          <button class="menu__card-dropdown-item share-item" data-item-id="${
            item.id
          }">
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
    initPagination(totalPages, (page) => {
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

        const itemIdStr = button.dataset.itemId;
        const itemId = Number(itemIdStr);

        const item = menuItems.find((i) => i.id === itemId);

        if (!item) {
          console.error('Item not found:', itemId);
          return;
        }

        // Add to cart
        addToCartAndNavigate(item);
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
        console.log('📦 Current cart:', cart);
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
      console.log(
        '📈 Increased quantity for:',
        item.title,
        'to',
        cart[existingItemIndex].quantity
      );
    } else {
      // Add new item to cart
      const cartItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        desc: item.desc || '',
        quantity: 1,
      };
      cart.push(cartItem);
      console.log('➕ Added new item:', item.title);
    }

    // Save to localStorage
    try {
      localStorage.setItem('restaurantCart', JSON.stringify(cart));
      console.log('✅ Cart saved to localStorage');
      console.log('📦 Cart now has', cart.length, 'unique items');
      console.log('🔍 Full cart:', cart);
    } catch (e) {
      console.error('❌ Error saving cart:', e);
    }

    // Update loader message
    if (window.GlobalLoader) {
      window.GlobalLoader.updateMessage('Redirecting to cart...');
    }

    // Navigate to cart page
    setTimeout(() => {
      console.log('🚀 Navigating to cart page...');
      window.location.href = '/cartpage/cart.html';
    }, 500);
  }

  // Setup menu icon dropdown handlers
  function setupMenuIconHandlers() {
    const menuButtons = container.querySelectorAll('.menu__card-menu-btn');

    menuButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = button.closest('.menu__card');
        const dropdown = card.querySelector('.menu__card-dropdown');

        // Close all other dropdowns
        document.querySelectorAll('.menu__card-dropdown').forEach((d) => {
          if (d !== dropdown) {
            d.style.display = 'none';
          }
        });

        // Toggle current dropdown
        if (dropdown.style.display === 'none') {
          dropdown.style.display = 'block';
        } else {
          dropdown.style.display = 'none';
        }
      });
    });

    // Handle dropdown item clicks
    const viewDetailsButtons = container.querySelectorAll('.view-details');
    viewDetailsButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const itemId = btn.dataset.itemId;
        console.log('👁️ View details for item:', itemId);

        // Close dropdown
        btn.closest('.menu__card-dropdown').style.display = 'none';

        // Show loader and navigate to product detail
        if (window.GlobalLoader) {
          window.GlobalLoader.show('Loading product details...');
        }

        setTimeout(() => {
          window.location.href = `../product-detail-page/index.html?id=${itemId}`;
        }, 200);
      });
    });

    const favoriteButtons = container.querySelectorAll('.add-to-favorites');
    favoriteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const itemId = btn.dataset.itemId;
        const item = menuItems.find((i) => i.id === itemId);

        console.log('❤️ Add to favorites:', item?.title);

        // Close dropdown
        btn.closest('.menu__card-dropdown').style.display = 'none';

        // Get favorites from localStorage
        let favorites = [];
        try {
          const favData = localStorage.getItem('restaurantFavorites');
          if (favData) favorites = JSON.parse(favData);
        } catch (e) {
          console.error('Error reading favorites:', e);
        }

        // Check if already in favorites
        const existingIndex = favorites.findIndex((f) => f.id === itemId);

        if (existingIndex > -1) {
          // Already in favorites
          if (window.showToast) {
            window.showToast(
              `${item.title} is already in your favorites!`,
              'info'
            );
          }
        } else {
          // Add to favorites
          favorites.push({
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            category: item.category,
          });

          localStorage.setItem('restaurantFavorites', JSON.stringify(favorites));
          console.log('✅ Added to favorites:', item.title);

          if (window.showToast) {
            window.showToast(`Added ${item.title} to favorites!`, 'success');
          }
        }
      });
    });

    const shareButtons = container.querySelectorAll('.share-item');
    shareButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const itemId = btn.dataset.itemId;
        const item = menuItems.find((i) => i.id === itemId);

        console.log('🔗 Share item:', item?.title);

        // Close dropdown
        btn.closest('.menu__card-dropdown').style.display = 'none';

        // Create shareable URL
        const shareUrl = `${window.location.origin}/product-detail-page/index.html?id=${itemId}`;

        // Try native Web Share API first
        if (navigator.share) {
          navigator
            .share({
              title: item.title,
              text: `Check out ${item.title} at our restaurant!`,
              url: shareUrl,
            })
            .then(() => {
              console.log('✅ Shared successfully');
            })
            .catch((err) => {
              console.log('Share cancelled:', err);
            });
        } else {
          // Fallback: Copy to clipboard
          navigator.clipboard
            .writeText(shareUrl)
            .then(() => {
              if (window.showToast) {
                window.showToast('Link copied to clipboard!', 'success');
              }
              console.log('📋 Copied to clipboard:', shareUrl);
            })
            .catch((err) => {
              console.error('Failed to copy:', err);
              if (window.showToast) {
                window.showToast('Could not copy link', 'error');
              }
            });
        }
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (
        !e.target.closest('.menu__card-menu-btn') &&
        !e.target.closest('.menu__card-dropdown')
      ) {
        document.querySelectorAll('.menu__card-dropdown').forEach((d) => {
          d.style.display = 'none';
        });
      }
    });
  }

  // Setup cart icon button handlers
  function setupCartIconHandlers() {
    const cartButtons = container.querySelectorAll('.menu__card-cart-btn');

    cartButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const itemIdStr = button.dataset.itemId;
        const itemId = Number(itemIdStr);

        const item = menuItems.find((i) => i.id === itemId);

        if (!item) {
          console.error('Item not found:', itemId);
          return;
        }

        console.log('🛒 Adding to cart via cart icon:', item.title);

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
          console.log(
            '📈 Increased quantity for:',
            item.title,
            'to',
            cart[existingItemIndex].quantity
          );
        } else {
          // Add new item to cart
          const cartItem = {
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            desc: item.desc || '',
            quantity: 1,
          };
          cart.push(cartItem);
          console.log('➕ Added new item to cart:', item.title);
        }

        // Save to localStorage
        try {
          localStorage.setItem('restaurantCart', JSON.stringify(cart));
          console.log('✅ Cart saved to localStorage');
          console.log('📦 Cart now has', cart.length, 'unique items');
        } catch (e) {
          console.error('❌ Error saving cart:', e);
        }

        // Show toast notification
        if (window.showToast) {
          const totalQty = cart[existingItemIndex]?.quantity || 1;
          window.showToast(
            `${item.title} added to cart (Qty: ${totalQty})`,
            'success',
            2000
          );
        }

        // Update cart count in header (if exists)
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
          const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
          cartCountEl.textContent = totalItems;
        }

        // Trigger fly animation (if function exists)
        const card = button.closest('.menu__card');
        const imgEl = card?.querySelector('.menu__card-image');
        const src =
          imgEl?.src || '../assets/images/home-page/menu-section/noodles.png';

        if (typeof animateToCart === 'function') {
          animateToCart(src, e.clientX, e.clientY);
        }
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

  render();
})();

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

// Toast helper
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

(function bindToastOnOrder() {
  const root = document.getElementById("menu-card-container");
  if (!root) return;
  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".menu__card-btn");
    if (!btn) return;
    const card = btn.closest(".menu__card");
    const title = (
      card?.querySelector(".menu__card-title")?.textContent || "Item"
    ).trim();
    if (typeof window.showToast === "function") {
      window.showToast(`Added “${title}” to cart`, "success", 1800);
    }
  });
})();

// shopping cart

(function cartSystem() {
  const cartIcon = document.getElementById("cart-icon");
  const countEl = document.getElementById("cart-count");
  let cartCount = 0;

  // Route to cart page
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      window.location.href = "/cartpage/cart.html";
    });
  }

  // listen Order Now
  const container = document.getElementById("menu-card-container");
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".menu__card-btn");
    if (!btn) return;

    cartCount++;
    countEl.textContent = cartCount;

    // lget image from card and fallback image
    const card = btn.closest(".menu__card");
    const imgEl = card?.querySelector(".menu__card-image");
    const src =
      imgEl?.src || "../assets/images/home-page/menu-section/noodles.png";

    animateToCart(src, e.clientX, e.clientY);
  });

  // animation image fly into cart logo
  function animateToCart(src, x, y) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "fly-img";
    img.style.left = x - 50 + "px";
    img.style.top = y - 50 + "px";
    document.body.appendChild(img);

    const cartRect = cartIcon.getBoundingClientRect();
    const deltaX = cartRect.left - x + 20;
    const deltaY = cartRect.top - y + 20;

    requestAnimationFrame(() => {
      img.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.1)`;
      img.style.opacity = "0";
    });

    img.addEventListener("transitionend", () => img.remove());
  }
})();

/* ========================================
 * CARD ROUTING TO PRODUCT DETAIL PAGE
 * Click anywhere on card except "Order Now +" button
 * ======================================== */

(function setupCardRouting() {
  const container = document.getElementById("menu-card-container");
  if (!container) return;

  // Event delegation for card clicks
  container.addEventListener("click", (e) => {
    // Check if click is on "Order Now +" button - if yes, do nothing (handled by cart system)
    const isOrderButton = e.target.closest(".menu__card-btn");
    if (isOrderButton) return;

    // Find the clicked card
    const card = e.target.closest(".menu__card");
    if (!card) return;

    // Get item ID from data attribute
    const itemId = card.dataset.itemId;
    if (!itemId) return;

    // Show global loader
    if (window.GlobalLoader) {
      window.GlobalLoader.show('Loading product...');
    }

    // Navigate to product detail page with item ID after brief delay
    setTimeout(() => {
      window.location.href = `../product-detail-page/index.html?id=${itemId}`;
    }, 200);
  });

  // Add visual feedback on hover (except for button)
  container.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".menu__card");
    if (card && !e.target.closest(".menu__card-btn")) {
      card.style.transform = "translateY(-4px)";
      card.style.transition = "transform 0.3s ease";
    }
  });

  container.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".menu__card");
    if (card) {
      card.style.transform = "";
    }
  });
})();
