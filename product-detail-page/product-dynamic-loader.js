/* ========================================
 * DYNAMIC PRODUCT DETAIL LOADER
 * Loads product details based on URL parameter ?id=X
 * ======================================== */

import { menuItems, dietaryBadges } from "../assets/data/mockdata.js";

/* ========================================
 * PRODUCT DETAIL DYNAMIC LOADER
 * ======================================== */

(function productDetailLoader() {
  /* ========================================
   * GET URL PARAMETERS
   * ======================================== */

  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  /* ========================================
   * FIND ITEM BY ID
   * ======================================== */

  function findItemById(id) {
    const itemId = parseInt(id);
    return menuItems.find((item) => item.id === itemId);
  }

  /* ========================================
   * FORMAT PRICE
   * ======================================== */

  function formatPrice(price) {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  /* ========================================
   * GENERATE STAR RATING HTML
   * ======================================== */

  function generateStarRating(rating = 4) {
    // Default 4 stars for now (can be enhanced later)
    let stars = "";
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars += `<img src="../assets/icons/product-detail-page/star-icon.svg" alt="Star" />`;
      } else {
        stars += `<img src="../assets/icons/product-detail-page/empty-star-icon.svg" alt="Star" />`;
      }
    }
    return stars;
  }

  /* ========================================
   * UPDATE PAGE TITLE
   * ======================================== */

  function updatePageTitle(item) {
    document.title = `${item.title} - Menu`;
  }

  /* ========================================
   * UPDATE PRODUCT IMAGE
   * ======================================== */

  function updateProductImage(item) {
    const imgElement = document.querySelector(".product-detail__img");
    if (imgElement) {
      imgElement.src = item.image;
      imgElement.alt = item.title;
    }
  }

  /* ========================================
   * UPDATE PRODUCT INFO
   * ======================================== */

  function updateProductInfo(item) {
    // Update title
    const titleElement = document.querySelector(".product-detail__title");
    if (titleElement) {
      titleElement.textContent = item.title;
    }

    // Update price
    const priceElement = document.querySelector(".product-detail__price");
    if (priceElement) {
      priceElement.textContent = formatPrice(item.price);
    }

    // Update description
    const descElement = document.querySelector(".product-detail__desc");
    if (descElement) {
      descElement.textContent = item.desc;
    }

    // Update rating stars (keeping default 4 stars)
    const starsContainer = document.querySelector(
      ".product-detail__rating .stars"
    );
    if (starsContainer) {
      starsContainer.innerHTML = generateStarRating(4);
    }
  }

  /* ========================================
   * UPDATE META INFORMATION
   * ======================================== */

  function updateMetaInfo(item) {
    const metaList = document.querySelector(".product-detail__meta");
    if (!metaList) return;

    // Generate SKU based on ID
    const sku = `PT${String(item.id).padStart(3, "0")}`;

    // Capitalize category
    const category =
      item.category.charAt(0).toUpperCase() + item.category.slice(1);

    // Generate tags from badges
    let tags = "Food, Restaurant";
    if (item.badges && item.badges.length > 0) {
      const badgeLabels = item.badges
        .map((badgeKey) => dietaryBadges[badgeKey]?.label)
        .filter(Boolean)
        .join(", ");
      if (badgeLabels) {
        tags = badgeLabels;
      }
    }

    // Update meta HTML
    metaList.innerHTML = `
      <li><strong>SKU:</strong> ${sku}</li>
      <li><strong>CATEGORY:</strong> ${category}</li>
      <li><strong>TAGS:</strong> ${tags}</li>
    `;
  }

  /* ========================================
   * ADD DIETARY BADGES TO PRODUCT INFO
   * ======================================== */

  function addDietaryBadges(item) {
    if (!item.badges || item.badges.length === 0) return;

    const infoSection = document.querySelector(".product-detail__info");
    const descElement = document.querySelector(".product-detail__desc");

    if (!infoSection || !descElement) return;

    // Check if badges already exist
    if (infoSection.querySelector(".product-detail__badges")) return;

    // Create badges container
    const badgesContainer = document.createElement("div");
    badgesContainer.className = "product-detail__badges";
    badgesContainer.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0;
    `;

    // Add each badge
    item.badges.forEach((badgeKey) => {
      const badge = dietaryBadges[badgeKey];
      if (!badge) return;

      const badgeEl = document.createElement("span");
      badgeEl.className = `product-badge product-badge--${badgeKey}`;
      badgeEl.title = badge.description;
      badgeEl.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        border-radius: 999px;
        font-family: var(--font-body);
        font-size: 0.875rem;
        font-weight: 500;
        color: #ffffff;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid ${badge.color};
      `;

      const icon = document.createElement("span");
      icon.textContent = badge.icon;
      icon.style.fontSize = "1rem";

      const label = document.createElement("span");
      label.textContent = badge.label;

      badgeEl.appendChild(icon);
      badgeEl.appendChild(label);
      badgesContainer.appendChild(badgeEl);
    });

    // Insert badges after description
    descElement.after(badgesContainer);
  }

  /* ========================================
   * UPDATE ADD TO CART BUTTON
   * ======================================== */

  function updateAddToCartButton(item) {
    const addToCartBtn = document.querySelector(
      ".product-detail__actions .btn--primary"
    );
    if (addToCartBtn) {
      // Store item data for cart functionality
      addToCartBtn.dataset.itemId = item.id;
      addToCartBtn.dataset.itemTitle = item.title;
      addToCartBtn.dataset.itemPrice = item.price;
    }
  }

  /* ========================================
   * DETERMINE PAIRING REASON
   * Logic to determine why items pair well
   * ======================================== */

  function determinePairingReason(currentItem, pairedItem) {
    const reasons = {
      sameCategory: "Complements the same meal type perfectly",
      spiceBalance: "Balances the spice level nicely",
      dietaryMatch: "Shares similar dietary preferences",
      contrastTexture: "Offers contrasting textures for variety",
      chefPick: "Recommended pairing by our chef",
      popularCombo: "A customer favorite combination",
    };

    // Check if both are chef's specials
    if (
      currentItem.badges?.includes("chef-special") &&
      pairedItem.badges?.includes("chef-special")
    ) {
      return reasons.chefPick;
    }

    // Check if both are popular
    if (
      currentItem.badges?.includes("popular") &&
      pairedItem.badges?.includes("popular")
    ) {
      return reasons.popularCombo;
    }

    // Check spice balance
    if (currentItem.spiceLevel >= 2 && pairedItem.spiceLevel === 0) {
      return reasons.spiceBalance;
    }

    // Check same category
    if (currentItem.category === pairedItem.category) {
      return reasons.sameCategory;
    }

    // Check dietary badges match
    const currentBadges = currentItem.badges || [];
    const pairedBadges = pairedItem.badges || [];
    const sharedBadges = currentBadges.filter((badge) =>
      pairedBadges.includes(badge)
    );
    if (sharedBadges.length > 0) {
      return reasons.dietaryMatch;
    }

    // Default reason
    return reasons.contrastTexture;
  }

  /* ========================================
   * CREATE MEAL PAIRING SECTION
   * Shows "Pairs Well With" suggestions
   * ======================================== */

  function createMealPairingSection(item) {
    // Check if item has pairing suggestions
    if (!item.pairsWith || item.pairsWith.length === 0) {
      return;
    }

    // Get pairing items
    const pairingItems = item.pairsWith
      .map((pairId) => {
        const pairedItem = findItemById(pairId);
        if (!pairedItem) return null;

        return {
          ...pairedItem,
          pairingReason: determinePairingReason(item, pairedItem),
        };
      })
      .filter(Boolean);

    // If no valid pairings, return
    if (pairingItems.length === 0) return;

    // Find where to insert (after badges or description)
    const descElement = document.querySelector(".product-detail__desc");
    const badgesElement = document.querySelector(".product-detail__badges");
    const insertAfter = badgesElement || descElement;

    if (!insertAfter) return;

    // Check if pairing section already exists
    if (document.querySelector(".meal-pairing")) return;

    // Create pairing section
    const pairingSection = document.createElement("div");
    pairingSection.className = "meal-pairing";
    pairingSection.style.cssText = `
      margin: 2rem 0;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: var(--radius);
      border: 1px solid rgba(255, 255, 255, 0.08);
    `;

    // Create header
    const header = document.createElement("div");
    header.className = "meal-pairing__header";
    header.style.cssText = `
      margin-bottom: 1.5rem;
      text-align: center;
    `;
    header.innerHTML = `
      <h3 style="
        font-family: var(--font-heading);
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-white);
        margin: 0 0 0.5rem 0;
      ">Pairs Well With</h3>
      <p style="
        font-family: var(--font-body);
        font-size: 0.875rem;
        color: var(--color-white-60);
        margin: 0;
      ">Enhance your meal with these perfect combinations</p>
    `;

    // Create grid
    const grid = document.createElement("div");
    grid.className = "meal-pairing__grid";
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    `;

    // Create pairing cards
    pairingItems.forEach((pairedItem) => {
      const card = createPairingCard(pairedItem);
      grid.appendChild(card);
    });

    // Assemble section
    pairingSection.appendChild(header);
    pairingSection.appendChild(grid);

    // Insert into page
    insertAfter.after(pairingSection);
  }

  /* ========================================
   * CREATE PAIRING CARD
   * Individual card for paired item
   * ======================================== */

  function createPairingCard(item) {
    const card = document.createElement("article");
    card.className = "pairing-card";
    card.style.cssText = `
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      border-radius: var(--radius);
      border: 2px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
    `;

    // Add hover effect
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-4px)";
      card.style.borderColor = "var(--color-dark-orange)";
      card.style.boxShadow = "0 8px 20px rgba(251, 143, 44, 0.2)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.borderColor = "rgba(255, 255, 255, 0.1)";
      card.style.boxShadow = "";
    });

    // Add click handler to navigate
    card.addEventListener("click", () => {
      window.location.href = `./index.html?id=${item.id}`;
    });

    // Image
    const imgWrapper = document.createElement("div");
    imgWrapper.style.cssText = `
      width: 100%;
      height: 120px;
      margin-bottom: 0.75rem;
      border-radius: var(--radius);
      overflow: hidden;
    `;

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    `;

    card.addEventListener("mouseenter", () => {
      img.style.transform = "scale(1.1)";
    });

    card.addEventListener("mouseleave", () => {
      img.style.transform = "";
    });

    imgWrapper.appendChild(img);

    // Title
    const title = document.createElement("h4");
    title.textContent = item.title;
    title.style.cssText = `
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 500;
      color: var(--color-white);
      margin: 0 0 0.5rem 0;
      transition: color 0.3s;
    `;

    card.addEventListener("mouseenter", () => {
      title.style.color = "var(--color-dark-orange)";
    });

    card.addEventListener("mouseleave", () => {
      title.style.color = "var(--color-white)";
    });

    // Description (truncated)
    const desc = document.createElement("p");
    desc.textContent =
      item.desc.length > 50 ? item.desc.substring(0, 50) + "..." : item.desc;
    desc.style.cssText = `
      font-family: var(--font-body);
      font-size: 0.75rem;
      color: var(--color-white-80);
      margin: 0 0 0.75rem 0;
      line-height: 1.4;
    `;

    // Pairing reason
    const reason = document.createElement("div");
    reason.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.5rem;
      margin-bottom: 0.75rem;
      background: rgba(251, 143, 44, 0.1);
      border-radius: var(--radius);
      border: 1px solid rgba(251, 143, 44, 0.2);
    `;

    const reasonIcon = document.createElement("span");
    reasonIcon.textContent = "💡";
    reasonIcon.style.cssText = `
      flex-shrink: 0;
      font-size: 1rem;
    `;

    const reasonText = document.createElement("p");
    reasonText.textContent = item.pairingReason;
    reasonText.style.cssText = `
      font-family: var(--font-body);
      font-size: 0.7rem;
      font-style: italic;
      color: var(--color-white-80);
      margin: 0;
      line-height: 1.3;
    `;

    reason.appendChild(reasonIcon);
    reason.appendChild(reasonText);

    // Price
    const price = document.createElement("span");
    price.textContent = formatPrice(item.price);
    price.style.cssText = `
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-dark-orange);
      margin-top: auto;
    `;

    // Assemble card
    card.appendChild(imgWrapper);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(reason);
    card.appendChild(price);

    return card;
  }

  /* ========================================
   * SHOW ERROR MESSAGE
   * ======================================== */

  function showErrorMessage() {
    const container = document.querySelector(".product-detail__container");
    if (!container) return;

    container.innerHTML = `
      <div style="
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        color: var(--color-white-80);
      ">
        <h2 style="
          font-family: var(--font-heading);
          font-size: 2rem;
          color: var(--color-white);
          margin-bottom: 1rem;
        ">Product Not Found</h2>
        <p style="margin-bottom: 2rem;">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <a href="../menupage/index.html" class="btn btn--primary">
          Back to Menu
        </a>
      </div>
    `;
  }

  /* ========================================
   * LOAD PRODUCT DETAILS
   * ======================================== */

  function loadProductDetails() {
    // Get item ID from URL
    const itemId = getUrlParameter("id");

    // If no ID provided, show default or first item
    if (!itemId) {
      console.warn("No product ID provided, showing default product");
      // You could redirect to menu or show first item
      // For now, we'll just keep the static content
      return;
    }

    // Find item by ID
    const item = findItemById(itemId);

    // If item not found, show error
    if (!item) {
      console.error(`Product with ID ${itemId} not found`);
      showErrorMessage();
      return;
    }

    // Update all product details
    updatePageTitle(item);
    updateProductImage(item);
    updateProductInfo(item);
    updateMetaInfo(item);
    addDietaryBadges(item);
    createMealPairingSection(item); // Add meal pairing suggestions
    updateAddToCartButton(item);

    console.log(`Loaded product: ${item.title} (ID: ${item.id})`);
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  function init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadProductDetails);
    } else {
      loadProductDetails();
    }
  }

  // Start initialization
  init();
})();
