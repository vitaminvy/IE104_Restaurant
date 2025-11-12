/* ========================================
 * SMART MEAL PAIRING SUGGESTIONS
 * ======================================== */

import { enhancedMenuItems } from "../data/menu-enhanced.js";

/* ========================================
 * MEAL PAIRING COMPONENT
 * ======================================== */

(function () {
  // CONFIGURATION
  const PAIRING_REASONS = {
    same_category: "Complements the same meal type perfectly",
    spice_balance: "Balances the spice level nicely",
    texture_contrast: "Offers contrasting textures for variety",
    flavor_profile: "Enhances the overall flavor profile",
    traditional_combo: "A classic combination loved by customers",
    chef_recommendation: "Personally recommended by our chef",
  };

  /* ========================================
   * GET PAIRING SUGGESTIONS
   * ======================================== */

  function getPairingSuggestions(currentItemId) {
    // Find current item
    const currentItem = enhancedMenuItems.find((item) => item.id === currentItemId);

    if (!currentItem || !currentItem.pairsWith) {
      return [];
    }

    // Get paired items
    const pairedItems = currentItem.pairsWith
      .map((pairId) => {
        const item = enhancedMenuItems.find((i) => i.id === pairId);
        if (!item) return null;

        // Determine pairing reason
        const reason = determinePairingReason(currentItem, item);

        return {
          ...item,
          pairingReason: reason,
        };
      })
      .filter(Boolean);

    return pairedItems;
  }

  /* ========================================
   * DETERMINE PAIRING REASON
   * ======================================== */

  function determinePairingReason(currentItem, pairedItem) {
    // Check if both have chef-special badge
    if (
      currentItem.badges.includes("chef-special") &&
      pairedItem.badges.includes("chef-special")
    ) {
      return PAIRING_REASONS.chef_recommendation;
    }

    // Check if both popular
    if (
      currentItem.badges.includes("popular") &&
      pairedItem.badges.includes("popular")
    ) {
      return PAIRING_REASONS.traditional_combo;
    }

    // Check spice balance
    if (currentItem.spiceLevel >= 2 && pairedItem.spiceLevel === 0) {
      return PAIRING_REASONS.spice_balance;
    }

    // Check same category
    if (currentItem.category === pairedItem.category) {
      return PAIRING_REASONS.same_category;
    }

    // Default reasons
    const reasons = [
      PAIRING_REASONS.flavor_profile,
      PAIRING_REASONS.texture_contrast,
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /* ========================================
   * CREATE PAIRING SECTION HTML
   * ======================================== */

  function createPairingSection(pairings) {
    // Create section container
    const section = document.createElement("section");
    section.className = "meal-pairing";

    // Header
    const header = document.createElement("div");
    header.className = "meal-pairing__header";

    const title = document.createElement("h2");
    title.className = "meal-pairing__title";
    title.textContent = "Pairs Well With";

    const subtitle = document.createElement("p");
    subtitle.className = "meal-pairing__subtitle";
    subtitle.textContent = "Enhance your meal with these perfect combinations";

    header.appendChild(title);
    header.appendChild(subtitle);

    // Grid container
    const grid = document.createElement("div");
    grid.className = "meal-pairing__grid";

    // Create cards
    if (pairings.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "meal-pairing__empty";
      emptyMsg.textContent = "No pairing suggestions available.";
      grid.appendChild(emptyMsg);
    } else {
      pairings.forEach((item) => {
        const card = createPairingCard(item);
        grid.appendChild(card);
      });
    }

    // Assemble section
    section.appendChild(header);
    section.appendChild(grid);

    return section;
  }

  /* ========================================
   * CREATE PAIRING CARD
   * ======================================== */

  function createPairingCard(item) {
    // Card container
    const card = document.createElement("article");
    card.className = "pairing-card";
    card.dataset.itemId = item.id;

    // Image wrapper
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "pairing-card__image-wrapper";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    img.className = "pairing-card__image";
    img.loading = "lazy";
    imgWrapper.appendChild(img);

    // Content
    const content = document.createElement("div");
    content.className = "pairing-card__content";

    const title = document.createElement("h3");
    title.className = "pairing-card__title";
    title.textContent = item.title;

    const desc = document.createElement("p");
    desc.className = "pairing-card__desc";
    desc.textContent = item.desc;

    content.appendChild(title);
    content.appendChild(desc);

    // Pairing reason
    const reason = document.createElement("div");
    reason.className = "pairing-card__reason";

    const reasonIcon = document.createElement("span");
    reasonIcon.className = "pairing-card__reason-icon";
    reasonIcon.textContent = "💡";

    const reasonText = document.createElement("p");
    reasonText.className = "pairing-card__reason-text";
    reasonText.textContent = item.pairingReason;

    reason.appendChild(reasonIcon);
    reason.appendChild(reasonText);

    // Footer
    const footer = document.createElement("div");
    footer.className = "pairing-card__footer";

    const price = document.createElement("span");
    price.className = "pairing-card__price";
    price.textContent = `$${item.price.toFixed(2)}`;

    const addBtn = document.createElement("button");
    addBtn.className = "pairing-card__add-btn";
    addBtn.textContent = "Add to Cart";
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleAddToCart(item);
    });

    footer.appendChild(price);
    footer.appendChild(addBtn);

    // Assemble card
    card.appendChild(imgWrapper);
    card.appendChild(content);
    card.appendChild(reason);
    card.appendChild(footer);

    // Make entire card clickable
    card.addEventListener("click", () => {
      // Navigate to product detail page (you can customize this)
      window.location.href = `../product-detail-page/index.html?id=${item.id}`;
    });

    return card;
  }

  /* ========================================
   * HANDLE ADD TO CART
   * ======================================== */

  function handleAddToCart(item) {
    // This is a placeholder - integrate with your existing cart system
    console.log(`Adding ${item.title} to cart`);

    // Show feedback
    showAddToCartFeedback(item.title);

    // You can dispatch a custom event for cart integration
    const event = new CustomEvent("addToCart", {
      detail: { item },
    });
    document.dispatchEvent(event);
  }

  /* ========================================
   * SHOW ADD TO CART FEEDBACK
   * ======================================== */

  function showAddToCartFeedback(itemName) {
    // Create toast notification
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: var(--color-dark-orange);
      color: white;
      border-radius: var(--radius);
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      animation: slideInUp 0.3s ease;
    `;
    toast.textContent = `✓ ${itemName} added to cart!`;

    // Add animation keyframes
    if (!document.querySelector("#toast-animation")) {
      const style = document.createElement("style");
      style.id = "toast-animation";
      style.textContent = `
        @keyframes slideInUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = "slideInUp 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* ========================================
   * INITIALIZE PAIRING SUGGESTIONS
   * ======================================== */

  function initPairingSuggestions() {
    // Check if we're on product detail page
    const productDetailSection = document.querySelector("#product-detail");
    if (!productDetailSection) return;

    // For demo purposes, use item ID 1 (you can get this from URL params)
    const urlParams = new URLSearchParams(window.location.search);
    const currentItemId = parseInt(urlParams.get("id")) || 1;

    // Get pairing suggestions
    const pairings = getPairingSuggestions(currentItemId);

    // Create and insert pairing section
    const pairingSection = createPairingSection(pairings);

    // Insert after product detail section
    productDetailSection.insertAdjacentElement("afterend", pairingSection);
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPairingSuggestions);
  } else {
    initPairingSuggestions();
  }
})();
