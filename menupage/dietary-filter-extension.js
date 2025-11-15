/* ========================================
 * DIETARY FILTER EXTENSION FOR MENUPAGE
 * This file extends menupage.js functionality
 * WITHOUT modifying the original code
 * ======================================== */

import { menuItems, dietaryBadges } from "../assets/data/mockdata.js";

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
    title.textContent = "Filter by dietary preferences:";
    dietaryFilterContainer.appendChild(title);

    // Create badge for each dietary type
    Object.entries(dietaryBadges).forEach(([key, badge]) => {
      const badgeBtn = document.createElement("button");
      badgeBtn.className = `dietary-badge dietary-badge--${key}`;
      badgeBtn.dataset.dietaryType = key;
      badgeBtn.setAttribute("role", "button");
      badgeBtn.setAttribute("aria-pressed", "false");
      badgeBtn.title = badge.description;

      // Badge icon
      const icon = document.createElement("span");
      icon.className = "dietary-badge__icon";
      icon.textContent = badge.icon;

      // Badge label
      const label = document.createElement("span");
      label.className = "dietary-badge__label";
      label.textContent = badge.label;

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

    // Re-render cards with filtered items
    renderFilteredCards(filteredItems);
  }

  /* ========================================
   * RENDER FILTERED CARDS
   * ======================================== */

  function renderFilteredCards(filteredItems) {
    const container = document.getElementById("menu-card-container");
    if (!container) return;

    // Format price helper
    const formatPrice = (p) =>
      p.toLocaleString("en-US", { style: "currency", currency: "USD" });

    // Render badges for a card
    const renderBadges = (badges) => {
      if (!badges || badges.length === 0) return "";

      return `
      <div class="menu__card-badges">
        ${badges
          .map((badgeKey) => {
            const badge = dietaryBadges[badgeKey];
            if (!badge) return "";
            return `<span class="menu__card-badge menu__card-badge--${badgeKey}" title="${badge.description}">
            <span class="menu__card-badge-icon">${badge.icon}</span>
            <span>${badge.label}</span>
          </span>`;
          })
          .join("")}
      </div>
    `;
    };

    // Card template with badges
  const cardTemplate = (item) => `
    <article class="menu__card animate-scale" data-item-id="${item.id}" data-item-title="${
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
          <p>No items match your dietary preferences.</p>
          <p style="font-size: 0.875rem; margin-top: 0.5rem;">Try different filters or browse all items.</p>
        </div>
      `;

      // Hide pagination
      const pagination = document.querySelector(".menu__pagination");
      if (pagination) pagination.style.display = "none";
      return;
    }

    // Render cards
    container.innerHTML = filteredItems.map(cardTemplate).join("");

    // Show pagination again if hidden
    const pagination = document.querySelector(".menu__pagination");
    if (pagination) pagination.style.display = "";

    // Note: Pagination is handled by original menupage.js
    // We're just rendering all filtered items for simplicity
  }

  /* ========================================
   * ADD BADGES TO EXISTING CARDS
   * ======================================== */

  function addBadgesToExistingCards() {
    const cards = document.querySelectorAll(".menu__card");

    cards.forEach((card, index) => {
      // Check if badges already added
      if (card.querySelector(".menu__card-badges")) return;

      // Get card title to match with menuItems
      const titleEl = card.querySelector(".menu__card-title");
      if (!titleEl) return;

      const title = titleEl.textContent.trim();

      // Find matching item in menuItems
      const matchingItem = menuItems.find((item) => item.title === title);
      if (!matchingItem || !matchingItem.badges) return;

      // Create badges HTML
      const badgesContainer = document.createElement("div");
      badgesContainer.className = "menu__card-badges";

      matchingItem.badges.forEach((badgeKey) => {
        const badge = dietaryBadges[badgeKey];
        if (!badge) return;

        const badgeEl = document.createElement("span");
        badgeEl.className = `menu__card-badge menu__card-badge--${badgeKey}`;
        badgeEl.title = badge.description;

        const icon = document.createElement("span");
        icon.className = "menu__card-badge-icon";
        icon.textContent = badge.icon;

        const label = document.createElement("span");
        label.textContent = badge.label;

        badgeEl.appendChild(icon);
        badgeEl.appendChild(label);
        badgesContainer.appendChild(badgeEl);
      });

      // Insert badges before meta section
      const meta = card.querySelector(".menu__card-meta");
      if (meta && badgesContainer.children.length > 0) {
        meta.before(badgesContainer);
      }
    });
  }

  /* ========================================
   * OBSERVE DOM CHANGES
   * ======================================== */

  function observeMenuChanges() {
    const container = document.getElementById("menu-card-container");
    if (!container) return;

    // Create observer to watch for card renders
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          // Only add badges if dietary filters are not active
          // (if active, our custom render handles it)
          if (selectedDietaryFilters.size === 0) {
            addBadgesToExistingCards();
          }
        }
      });
    });

    // Start observing
    observer.observe(container, {
      childList: true,
      subtree: true,
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
          } else {
            // Just add badges to newly rendered cards
            addBadgesToExistingCards();
          }
        }, 100);
      });
    });
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
      return;
    }

    // Small delay to ensure menupage.js has initialized
    setTimeout(() => {
      // Create dietary filter UI
      createDietaryFilterBar();

      // Add badges to initial cards
      addBadgesToExistingCards();

      // Observe for future changes
      observeMenuChanges();

      // Setup category filter listener
      setupCategoryFilterListener();
    }, 100);
  }

  // Start initialization
  init();
})();
