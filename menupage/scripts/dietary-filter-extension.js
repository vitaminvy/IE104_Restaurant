/* ========================================
 * DIETARY FILTER EXTENSION FOR MENUPAGE
 * This file extends menupage.js functionality
 * WITHOUT modifying the original code
 * ======================================== */

import { menuItems, dietaryBadges } from "../../assets/data/mockdata.js";
import i18nService from "../../assets/script/i18n-service.js";
import { initPagination } from './pagination.js';

/* ========================================
 * DIETARY FILTER EXTENSION SYSTEM
 * ======================================== */

(function dietaryFilterExtension() {
  // State management
  let selectedDietaryFilters = new Set();
  let currentCategoryFilter = "breakfast";
  let originalMenuItems = [...menuItems];

  /* ========================================
   * CREATE DIETARY FILTER UI
   * ======================================== */

  function createDietaryFilterBar() {
    // Check if already exists to avoid duplicates
    if (document.querySelector(".dietary-filter")) {
      return;
    }

    // Create container for dietary filters
    const dietaryFilterContainer = document.createElement("div");
    dietaryFilterContainer.className = "dietary-filter";

    // Add title
    const title = document.createElement("span");
    title.className = "dietary-filter__title";
    title.textContent = i18nService.t("menu_page.dietary_filter.title");
    dietaryFilterContainer.appendChild(title);

    // Create badge for each dietary type
    Object.entries(dietaryBadges).forEach(([key, badge]) => {
      const badgeBtn = document.createElement("button");
      badgeBtn.className = `dietary-badge dietary-badge--${key}`;
      badgeBtn.dataset.dietaryType = key;
      badgeBtn.setAttribute("role", "button");
      badgeBtn.setAttribute("aria-pressed", "false");
      badgeBtn.title = i18nService.t(badge.description);
      
      // Badge icon
      const icon = document.createElement("span");
      icon.className = "dietary-badge__icon";
      icon.textContent = badge.icon;
      
      // Badge label
      const label = document.createElement("span");
      label.className = "dietary-badge__label";
      label.textContent = i18nService.t(badge.label);

      // Append icon and label
      badgeBtn.appendChild(icon);
      badgeBtn.appendChild(label);

      // Add click event
      badgeBtn.addEventListener("click", () =>
        toggleDietaryFilter(key, badgeBtn)
      );

      dietaryFilterContainer.appendChild(badgeBtn);
    });

    // Insert dietary filter after category filter
    const filterNav = document.querySelector(".menu__filter");
    if (filterNav) {
      filterNav.insertAdjacentElement("afterend", dietaryFilterContainer);
    }
  }

  /* ========================================
   * TOGGLE DIETARY FILTER
   * ======================================== */

  function toggleDietaryFilter(filterType, buttonElement) {
    // Toggle selection
    if (selectedDietaryFilters.has(filterType)) {
      selectedDietaryFilters.delete(filterType);
      buttonElement.classList.remove("dietary-badge--active");
      buttonElement.setAttribute("aria-pressed", "false");
    } else {
      selectedDietaryFilters.add(filterType);
      buttonElement.classList.add("dietary-badge--active");
      buttonElement.setAttribute("aria-pressed", "true");
    }

    // Apply dietary filtering
    applyDietaryFiltering();
  }

  /* ========================================
   * APPLY DIETARY FILTERING
   * ======================================== */

  function applyDietaryFiltering() {
    // Filter menuItems based on selected dietary filters
    let filteredItems = [...originalMenuItems];

    // Apply category filter first (get current active category)
    const activeCategory = document.querySelector(
      ".menu__filter-item--active"
    );
    if (activeCategory) {
      currentCategoryFilter = activeCategory.dataset.category || "breakfast";
    }

    // Filter by category
    filteredItems = filteredItems.filter(
      (item) => item.category === currentCategoryFilter
    );

    // Apply dietary filters if any selected
    if (selectedDietaryFilters.size > 0) {
      filteredItems = filteredItems.filter((item) => {
        // Check if item has ALL selected dietary badges
        return Array.from(selectedDietaryFilters).every((filter) =>
          item.badges && item.badges.includes(filter)
        );
      });
    }

    let itemsPerPage = 8;
    let currentPage = 1;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredItems.slice(start, end);

    // Re-render cards with filtered items using the shared template
    renderFilteredCards(pageData);

    // Trigger scroll animations for newly rendered cards
    const container = document.getElementById("menu-card-container");
    if (window.ScrollAnimations && window.ScrollAnimations.observe && container) {
      // Re-observe all animated elements
      const animatedElements = container.querySelectorAll('[class*="animate-"]');
      animatedElements.forEach(el => {
        window.ScrollAnimations.observe(el);
      });
    }

    // Initialize pagination
    initPagination(totalPages, currentPage, (page) => {
      currentPage = page;
      const newStart = (page - 1) * itemsPerPage;
      const newEnd = newStart + itemsPerPage;
      const newPageData = filteredItems.slice(newStart, newEnd);
      renderFilteredCards(newPageData);
      
      if (container) {
        window.scrollTo({ top: container.offsetTop - 160, behavior: 'smooth' });
      }
    });
  }

  /* ========================================
   * RENDER FILTERED CARDS
   * Uses the shared cardTemplate from menupage.js
   * ======================================== */

  function renderFilteredCards(filteredItems) {
    const container = document.getElementById("menu-card-container");
    if (!container) return;

    // Show empty state if no items match
    if (filteredItems.length === 0) {
      container.innerHTML = `
        <div class="menu__empty-message" style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          color: var(--color-white-60);
          font-family: var(--font-body);
          font-size: 1.125rem;
        ">
          <p>${i18nService.t("menu_page.empty_message.no_items")}</p>
          <p style="font-size: 0.875rem; margin-top: 0.5rem;">${i18nService.t("menu_page.empty_message.try_filters")}</p>
        </div>
      `;

      // Hide pagination
      const pagination = document.querySelector(".menu__pagination");
      if (pagination) pagination.style.display = "none";
      return;
    }

    // Use the shared card template from menupage.js
    if (window.menuPageCardTemplate) {
      container.innerHTML = filteredItems.map(window.menuPageCardTemplate).join("");
    } else {
      // Fallback: render basic cards if template not available
      console.warn("menuPageCardTemplate not found, using fallback rendering");
      container.innerHTML = filteredItems.map(item => {
        const title = i18nService.t(item.title);
        const desc = i18nService.t(item.desc);
        return `
          <a class="menu__card" data-item-id="${item.id}">
            <div class="menu__card-img-wrapper">
              <img src="${item.image}" alt="${title}" class="menu__card-image"/>
            </div>
            <div class="menu__card-content">
              <h3 class="menu__card-title">${title}</h3>
              <p class="menu__card-desc">${desc}</p>
              <div class="menu__card-meta">
                <span class="menu__card-price">$${item.price.toFixed(2)}</span>
              </div>
            </div>
          </a>
        `;
      }).join("");
    }

    // Show pagination again if hidden
    const pagination = document.querySelector(".menu__pagination");
    if (pagination) pagination.style.display = "";

    // Setup button handlers after rendering
    setupOrderButtonHandlers();
    setupCartIconHandlers();

    // Trigger scroll animations
    if (window.ScrollAnimations && window.ScrollAnimations.observe) {
      const animatedElements = container.querySelectorAll('[class*="animate-"]');
      animatedElements.forEach(el => {
        window.ScrollAnimations.observe(el);
      });
    }

    // Check for allergen warnings
    checkMenuCardsForAllergens();
  }

  /* ========================================
   * ALLERGEN WARNING BADGE FUNCTIONS
   * ======================================== */

  function getUserAllergens() {
    try {
      const stored = localStorage.getItem('userAllergens');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function checkMenuCardsForAllergens() {
    const userAllergens = getUserAllergens();
    if (userAllergens.length === 0) return;

    const container = document.getElementById('menu-card-container');
    if (!container) return;

    const menuCards = container.querySelectorAll('.menu__card');

    menuCards.forEach(card => {
      const itemId = card.getAttribute('data-item-id');
      if (!itemId) return;

      const item = menuItems.find(i => i.id === parseInt(itemId));

      if (!item || !item.allergens || item.allergens.length === 0) {
        removeWarningBadgeFromCard(card);
        return;
      }

      const conflicts = item.allergens.filter(allergen =>
        userAllergens.includes(allergen)
      );

      if (conflicts.length > 0) {
        addWarningBadgeToCard(card, conflicts);
      } else {
        removeWarningBadgeFromCard(card);
      }
    });
  }

  function addWarningBadgeToCard(card, conflicts) {
    if (card.querySelector('.allergy-warning-badge')) {
      return;
    }

    const badge = document.createElement('div');
    badge.className = 'allergy-warning-badge';

    const allergenNames = conflicts.map(key => {
      const translation = i18nService.t(`allergens.${key}.name`);
      return translation || key;
    }).join(', ');

    const tooltipText = i18nService.t("allergy_settings.badge_tooltip") || "Contains: {allergens}";
    badge.setAttribute('title', tooltipText.replace('{allergens}', allergenNames));

    const badgeIcon = document.createElement('img');
    badgeIcon.src = '../assets/icons/features/warning-sign.png';
    badgeIcon.alt = 'Warning';
    badgeIcon.style.width = '16px';
    badgeIcon.style.height = '16px';
    badge.appendChild(badgeIcon);

    badge.style.cssText = `
      position: absolute;
      top: 8px;
      left: 8px;
      width: 32px;
      height: 32px;
      background: #dc2626;
      color: white;
      border: 2px solid var(--border-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.5);
      animation: pulse 2.5s ease-in-out infinite;
      backdrop-filter: blur(10px);
      cursor: help;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(239, 68, 68, 0.2);
    `;

    card.style.position = 'relative';
    card.appendChild(badge);
  }

  function removeWarningBadgeFromCard(card) {
    const badge = card.querySelector('.allergy-warning-badge');
    if (badge) {
      badge.remove();
    }
  }

  /* ========================================
   * CART HANDLING LOGIC
   * ======================================== */

  // Add to cart and navigate
  function addToCartAndNavigate(item) {
    if (window.GlobalLoader) {
      window.GlobalLoader.show("Adding to cart...");
    }

    let cart = [];
    try {
      const cartData = localStorage.getItem("restaurantCart");
      if (cartData) {
        cart = JSON.parse(cartData);
      }
    } catch (e) {
      // console.error("Error reading cart:", e);
    }

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
      const cartItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        desc: item.desc || "",
        quantity: 1,
      };
      cart.push(cartItem);
    }

    try {
      localStorage.setItem("restaurantCart", JSON.stringify(cart));
    } catch (e) {
      // console.error("Error saving cart:", e);
    }

    if (window.GlobalLoader) {
      window.GlobalLoader.updateMessage("Redirecting to cart...");
    }

    setTimeout(() => {
      window.location.href = "/cartpage/";
    }, 500);
  }

  function setupOrderButtonHandlers() {
    const container = document.getElementById("menu-card-container");
    if (!container) return;
    const orderButtons = container.querySelectorAll(".menu__card-btn");

    orderButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
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
        
        // Use enhanced add to cart if available
        if (window.enhancedAddToCart) {
          window.enhancedAddToCart(cartItem, button, true);
        } else {
          addToCartAndNavigate(cartItem);
        }
      });
    });
  }

  function setupCartIconHandlers() {
    const container = document.getElementById("menu-card-container");
    if (!container) return;
    const cartButtons = container.querySelectorAll(".menu__card-cart-btn");

    cartButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
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

        const preparedItem = { ...item, title, desc };

        // Use enhanced add to cart if available
        if (window.enhancedAddToCart) {
          window.enhancedAddToCart(preparedItem, button, false);
          return;
        }

        // Fallback implementation
        button.style.transform = "scale(0.85)";
        setTimeout(() => {
          button.style.transform = "";
        }, 200);

        let cart = [];
        try {
          const cartData = localStorage.getItem("restaurantCart");
          if (cartData) {
            cart = JSON.parse(cartData);
          }
        } catch (e) {
          // console.error("Error reading cart:", e);
        }

        const existingItemIndex = cart.findIndex(
          (cartItem) => cartItem.id === preparedItem.id
        );

        if (existingItemIndex > -1) {
          cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
        } else {
          const cartItem = {
            id: preparedItem.id,
            title: preparedItem.title,
            price: preparedItem.price,
            image: preparedItem.image,
            desc: preparedItem.desc || "",
            quantity: 1,
          };
          cart.push(cartItem);
        }

        try {
          localStorage.setItem("restaurantCart", JSON.stringify(cart));
        } catch (e) {
          // console.error("Error saving cart:", e);
        }

        if (window.showToast) {
          const totalQty = cart.find(i => i.id === preparedItem.id)?.quantity || 1;
          window.showToast(
            `${preparedItem.title} added to cart (Qty: ${totalQty})`,
            "success",
            2000
          );
        }

        const cartCountEl = document.getElementById("cart-count");
        if (cartCountEl) {
          const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
          cartCountEl.textContent = totalItems;
        }
      });
    });
  }

  /* ========================================
   * HOOK INTO CATEGORY FILTER CHANGES
   * ======================================== */

  function setupCategoryFilterListener() {
    const categoryFilters = document.querySelectorAll(".menu__filter-item");

    categoryFilters.forEach((filter) => {
      filter.addEventListener("click", () => {
        // Wait for original script to change category
        setTimeout(() => {
          // Update current category
          const activeCategory = document.querySelector(
            ".menu__filter-item--active"
          );
          if (activeCategory) {
            currentCategoryFilter =
              activeCategory.dataset.category || "breakfast";
          }

          // Re-apply dietary filtering if any filters active
          if (selectedDietaryFilters.size > 0) {
            applyDietaryFiltering();
          }
        }, 100);
      });
    });
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  function initializeExtension() {
    // Create dietary filter UI
    createDietaryFilterBar();

    // Setup category filter listener
    setupCategoryFilterListener();
  }

  // Listen for the language-changed event to re-initialize
  document.addEventListener('language-changed', () => {
    // Re-create the filter bar to update text
    const existingFilter = document.querySelector(".dietary-filter");
    if (existingFilter) {
      existingFilter.remove();
    }
    initializeExtension();
    
    // Re-apply filters if any are active
    if (selectedDietaryFilters.size > 0) {
      applyDietaryFiltering();
    }
  });

  // Initial load
  if (Object.keys(i18nService.getTranslations()).length > 0) {
    initializeExtension();
  }
})();