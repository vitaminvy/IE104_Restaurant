/* ========================================
 * DIETARY FILTER SYSTEM FUNCTIONALITY
 * ======================================== */

import { enhancedMenuItems, dietaryBadges } from "../data/menu-enhanced.js";

/* ========================================
 * DIETARY FILTER COMPONENT
 * ======================================== */

(function () {
  // DOM ELEMENTS
  const menuSection = document.querySelector("#menu");
  const filterNav = document.querySelector(".menu__filter");

  // Only run if menu section exists
  if (!menuSection || !filterNav) return;

  // STATE
  let selectedDietaryFilters = new Set(); // Track selected dietary filters

  /* ========================================
   * CREATE DIETARY FILTER UI
   * ======================================== */

  function createDietaryFilterBar() {
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
      badgeBtn.addEventListener("click", () => toggleDietaryFilter(key, badgeBtn));

      dietaryFilterContainer.appendChild(badgeBtn);
    });

    // Insert dietary filter after category filter
    filterNav.insertAdjacentElement("afterend", dietaryFilterContainer);
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

    // Trigger menu re-render with dietary filters
    applyDietaryFilters();
  }

  /* ========================================
   * APPLY DIETARY FILTERS TO MENU
   * ======================================== */

  function applyDietaryFilters() {
    // Get current category filter
    const activeCategory = document.querySelector(
      ".menu__filter-item--active"
    );
    const category = activeCategory?.dataset.category || "breakfast";

    // Filter items by category first
    let filteredItems = enhancedMenuItems.filter(
      (item) => item.category === category
    );

    // Apply dietary filters if any selected
    if (selectedDietaryFilters.size > 0) {
      filteredItems = filteredItems.filter((item) => {
        // Check if item has ALL selected dietary badges
        return Array.from(selectedDietaryFilters).every((filter) =>
          item.badges.includes(filter)
        );
      });
    }

    // Re-render menu with filtered items
    renderFilteredMenu(filteredItems);
  }

  /* ========================================
   * RENDER FILTERED MENU
   * ======================================== */

  function renderFilteredMenu(items) {
    const menuGrid = document.querySelector(".menu__grid");
    if (!menuGrid) return;

    // Clear existing cards
    menuGrid.innerHTML = "";

    // If no items match filters, show message
    if (items.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "menu__empty-message";
      emptyMessage.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--color-white-60);
        font-family: var(--font-body);
        font-size: 1.125rem;
      `;
      emptyMessage.textContent = "No items match your dietary preferences. Try different filters.";
      menuGrid.appendChild(emptyMessage);
      return;
    }

    // Render each item with dietary badges
    items.forEach((item) => {
      const card = createEnhancedMenuCard(item);
      menuGrid.appendChild(card);
    });
  }

  /* ========================================
   * CREATE ENHANCED MENU CARD
   * ======================================== */

  function createEnhancedMenuCard(item) {
    // Create card element
    const card = document.createElement("article");
    card.className = "menu__card";

    // Image wrapper
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "menu__card-img-wrapper";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    img.className = "menu__card-image";
    imgWrapper.appendChild(img);

    // Title
    const title = document.createElement("h3");
    title.className = "menu__card-title";
    title.textContent = item.title;

    // Description
    const desc = document.createElement("p");
    desc.className = "menu__card-desc";
    desc.textContent = item.desc;

    // Dietary badges container
    const badgesContainer = document.createElement("div");
    badgesContainer.className = "menu__card-badges";

    // Add dietary badges
    item.badges.forEach((badgeKey) => {
      const badgeInfo = dietaryBadges[badgeKey];
      if (!badgeInfo) return;

      const badge = document.createElement("span");
      badge.className = `menu__card-badge menu__card-badge--${badgeKey}`;
      badge.title = badgeInfo.description;

      const icon = document.createElement("span");
      icon.className = "menu__card-badge-icon";
      icon.textContent = badgeInfo.icon;

      const label = document.createElement("span");
      label.textContent = badgeInfo.label;

      badge.appendChild(icon);
      badge.appendChild(label);
      badgesContainer.appendChild(badge);
    });

    // Footer with price and button
    const footer = document.createElement("div");
    footer.className = "menu__card-footer";

    const orderBtn = document.createElement("a");
    orderBtn.href = "#";
    orderBtn.className = "menu__card-btn";
    orderBtn.innerHTML = `
      Order Now
      <img src="../assets/icons/home-page/menu-section/arrown.svg" alt="" class="menu__card-btn-icon" />
    `;

    const price = document.createElement("span");
    price.className = "menu__card-price";
    price.textContent = `$${item.price}`;

    footer.appendChild(orderBtn);
    footer.appendChild(price);

    // Assemble card
    card.appendChild(imgWrapper);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(badgesContainer);
    card.appendChild(footer);

    return card;
  }

  /* ========================================
   * INTEGRATE WITH EXISTING CATEGORY FILTER
   * ======================================== */

  function integrateWithCategoryFilter() {
    const categoryFilters = document.querySelectorAll(".menu__filter-item");

    categoryFilters.forEach((filterItem) => {
      filterItem.addEventListener("click", () => {
        // Wait for category change, then apply dietary filters
        setTimeout(() => {
          applyDietaryFilters();
        }, 100);
      });
    });
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  function init() {
    // Create dietary filter UI
    createDietaryFilterBar();

    // Integrate with existing category filters
    integrateWithCategoryFilter();

    // Initial render with enhanced data
    applyDietaryFilters();
  }

  // Start the dietary filter system
  init();
})();
