/* ========================================
 * DYNAMIC PRODUCT DETAIL LOADER
 * Loads product details based on URL parameter ?id=X
 * ======================================== */

import { menuItems, dietaryBadges } from "../../assets/data/mockdata.js";
import i18nService from "../../assets/script/i18n-service.js";

/* ========================================
 * PRODUCT DETAIL DYNAMIC LOADER
 * ======================================== */

(function productDetailLoader() {
  /* ========================================
   * ANIMATION STYLES INJECTION
   * ======================================== */

  function injectAnimationStyles() {
    // Check if styles already exist
    if (document.getElementById("pairing-animations")) return;

    const styleSheet = document.createElement("style");
    styleSheet.id = "pairing-animations";
    styleSheet.textContent = `
      /* Gentle fade-in (subtle entrance) */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Soft slide-in for cards */
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Smooth fade-out for swap (no rotation) */
      @keyframes smoothFadeOut {
        from {
          opacity: 1;
          transform: scale(1);
          filter: blur(0);
        }
        to {
          opacity: 0;
          transform: scale(0.98);
          filter: blur(2px);
        }
      }

      /* Gentle scale-in */
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.97);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Gentle shimmer effect */
      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
          opacity: 0.5;
        }
        50% {
          opacity: 0.8;
        }
        100% {
          background-position: 1000px 0;
          opacity: 0.5;
        }
      }

      /* Gentle bounce entrance */
      @keyframes bounceIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(15px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      /* Ultra-smooth fade out */
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      /* Crossfade overlay */
      @keyframes crossfadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      /* Subtle entrance animations - no jarring movements */
      .product-detail__content.animate-in {
        animation: fadeInUp 0.4s ease-out forwards;
      }

      .product-detail__img.animate-in {
        animation: scaleIn 0.4s ease-out forwards;
      }

      .meal-pairing.animate-in {
        animation: bounceIn 0.4s ease-out forwards;
      }

      .pairing-card.animate-in {
        animation: slideInRight 0.3s ease-out forwards;
        opacity: 0;
      }

      /* Very subtle staggering */
      .pairing-card.animate-in:nth-child(1) { animation-delay: 0.05s; }
      .pairing-card.animate-in:nth-child(2) { animation-delay: 0.08s; }
      .pairing-card.animate-in:nth-child(3) { animation-delay: 0.11s; }

      /* Smooth swap - focus on fade out, not complex transforms */
      .product-detail__content.swapping {
        animation: smoothFadeOut 0.3s ease-out forwards;
      }

      .product-detail__img.swapping {
        animation: smoothFadeOut 0.3s ease-out forwards;
      }

      .meal-pairing.swapping {
        animation: fadeOut 0.3s ease-out forwards;
      }

      /* Smooth loading shimmer */
      .loading-shimmer {
        background: linear-gradient(
          110deg,
          rgba(255, 255, 255, 0.03) 0%,
          rgba(255, 255, 255, 0.08) 20%,
          rgba(251, 143, 44, 0.15) 40%,
          rgba(255, 255, 255, 0.08) 60%,
          rgba(255, 255, 255, 0.03) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.8s ease-in-out infinite;
        will-change: background-position;
      }

      /* Smooth all transitions globally */
      .pairing-card,
      .product-detail__img,
      .product-detail__content {
        backface-visibility: hidden;
        -webkit-font-smoothing: antialiased;
        transform: translateZ(0);
      }
    `;
    document.head.appendChild(styleSheet);
  }

  // Inject animation styles on load
  injectAnimationStyles();
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
    document.title = `${i18nService.t(item.title)} - ${i18nService.t(
      "product_detail_page.title"
    )}`;
  }

  /* ========================================
   * UPDATE PRODUCT IMAGE
   * ======================================== */

  function updateProductImage(item) {
    const imgElement = document.querySelector(".product-detail__img");
    if (imgElement) {
      // Add loading shimmer
      imgElement.classList.add("loading-shimmer");

      // Create new image to preload
      const newImg = new Image();
      newImg.src = item.image;

      newImg.onload = () => {
        imgElement.src = item.image;
        imgElement.alt = i18nService.t(item.title);
        imgElement.classList.remove("loading-shimmer");
        imgElement.classList.add("animate-in");

        // Remove animation class after completion
        setTimeout(() => {
          imgElement.classList.remove("animate-in");
        }, 400);
      };
    }
  }

  /* ========================================
   * UPDATE PRODUCT INFO
   * ======================================== */

  function updateProductInfo(item) {
    // Get content wrapper
    const contentElement = document.querySelector(".product-detail__content");

    // Update title
    const titleElement = document.querySelector(".product-detail__title");
    if (titleElement) {
      titleElement.textContent = i18nService.t(item.title);
    }

    // Update price
    const priceElement = document.querySelector(".product-detail__price");
    if (priceElement) {
      priceElement.textContent = formatPrice(item.price);
    }

    // Update description
    const descElement = document.querySelector(".product-detail__desc");
    if (descElement) {
      descElement.textContent = i18nService.t(item.desc);
    }

    // Add subtle entrance animation to content
    if (contentElement) {
      contentElement.classList.add("animate-in");
      setTimeout(() => {
        contentElement.classList.remove("animate-in");
      }, 400);
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
    // console.log("  --- updateMetaInfo called ---");
    const metaList = document.querySelector(".product-detail__meta");
    if (!metaList) return;

    // Generate SKU based on ID
    const sku = `PT${String(item.id).padStart(3, "0")}`;

    // Capitalize and translate category
    const categoryKey = `home.menu.filter.${item.category}`;
    const category = i18nService.t(categoryKey);
    // console.log(`    Category Key: ${categoryKey}, Translated: ${category}`);

    // Generate tags from badges and translate
    let tags = i18nService.t("product_detail_page.meta.default_tags"); // Default tags
    if (item.badges && item.badges.length > 0) {
      const badgeLabels = item.badges
        .map((badgeKey) => {
          const labelKey = dietaryBadges[badgeKey]?.label;
          const translatedLabel = i18nService.t(labelKey);
          // console.log(
          //   `      Badge Label Key: ${labelKey}, Translated: ${translatedLabel}`
          // );
          return translatedLabel;
        })
        .filter(Boolean)
        .join(", ");
      if (badgeLabels) {
        tags = badgeLabels;
      }
    }
    // console.log(`    Tags: ${tags}`);

    // Update meta HTML, relying on data-i18n for labels
    metaList.innerHTML = `
      <li><strong data-i18n="product_detail_page.meta.sku">SKU:</strong> ${sku}</li>
      <li><strong data-i18n="product_detail_page.meta.category">CATEGORY:</strong> ${category}</li>
      <li><strong data-i18n="product_detail_page.meta.tags">TAGS:</strong> ${tags}</li>
    `;
  }

  /* ========================================
   * ADD DIETARY BADGES TO PRODUCT INFO
   * ======================================== */

  function addDietaryBadges(item) {
    // console.log("  --- addDietaryBadges called ---");
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
      if (!badge) {
        // console.warn(`    Dietary badge key not found: ${badgeKey}`);
        return;
      }

      const badgeEl = document.createElement("span");
      badgeEl.className = `product-badge product-badge--${badgeKey}`;

      const descriptionKey = badge.description;
      const translatedDescription = i18nService.t(descriptionKey);
      badgeEl.title = translatedDescription;
      // console.log(
      //   `      Badge Description Key: ${descriptionKey}, Translated: ${translatedDescription}`
      // );

      badgeEl.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        border-radius: 999px;
        font-family: var(--font-body);
        font-size: 0.875rem;
        font-weight: 500;
        border: 1px solid ${badge.color};
      `;

      const icon = document.createElement("span");
      icon.textContent = badge.icon;
      icon.style.fontSize = "1rem";

      const labelKey = badge.label;
      const translatedLabel = i18nService.t(labelKey);
      const label = document.createElement("span");
      label.textContent = translatedLabel;
      // console.log(
      //   `      Badge Label Key: ${labelKey}, Translated: ${translatedLabel}`
      // );

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
      addToCartBtn.dataset.itemTitle = i18nService.t(item.title);
      addToCartBtn.dataset.itemPrice = item.price;
      addToCartBtn.dataset.itemImage = item.image;

      // Remove any existing listeners by cloning the button
      const newBtn = addToCartBtn.cloneNode(true);
      addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);

      // Add click handler
      newBtn.addEventListener("click", (e) => {
        e.preventDefault();
        handleAddToCart(item);
      });
    }
  }

  /* ========================================
   * HANDLE ADD TO CART
   * Adds item to cart with proper integration
   * ======================================== */

  function handleAddToCart(item) {
    // Get quantity
    const quantityInput = document.querySelector(".qty-input");
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

    // Get title from the DOM to avoid race condition
    const title =
      document.querySelector(".product-detail__title")?.textContent ||
      i18nService.t(item.title);

    // Prepare cart item
    const cartItem = {
      id: item.id,
      title: title, // Already translated from DOM
      price: item.price,
      image: item.image,
      quantity: quantity,
    };

    // Add to cart using CartManager API (if available)
    if (
      window.CartManager &&
      typeof window.CartManager.addItem === "function"
    ) {
      window.CartManager.addItem(cartItem);
      showAddToCartNotification(title, quantity, true);
    } else {
      // Fallback: Save to localStorage directly
      addToCartFallback(cartItem);
      showAddToCartNotification(title, quantity, false);
    }

    // Reset quantity to 1
    if (quantityInput) {
      quantityInput.value = 1;
    }
  }

  /* ========================================
   * FALLBACK: ADD TO CART WITHOUT CARTMANAGER
   * Direct localStorage implementation
   * ======================================== */

  function addToCartFallback(cartItem) {
    try {
      const cartKey = "restaurantCart";
      let items = [];

      // Get existing cart
      const existingCart = localStorage.getItem(cartKey);
      if (existingCart) {
        items = JSON.parse(existingCart);
      }

      // Check if item already exists
      const existingIndex = items.findIndex((i) => i.id === cartItem.id);

      if (existingIndex >= 0) {
        // Update quantity
        items[existingIndex].quantity += cartItem.quantity;
      } else {
        // Add new item
        items.push(cartItem);
      }

      // Save to localStorage
      localStorage.setItem(cartKey, JSON.stringify(items));

      // console.log("Item added to cart (fallback):", cartItem);
    } catch (error) {
      // console.error("Error adding to cart:", error);
    }
  }

  /* ========================================
   * SHOW ADD TO CART NOTIFICATION
   * Displays success message
   * ======================================== */

  function showAddToCartNotification(itemTitle, quantity, hasCartManager) {
    // Manually get translated strings
    const translatedAddedToCart = i18nService.t("product_detail_page.notification.added_to_cart");
    const translatedViewCart = i18nService.t("product_detail_page.notification.view_cart");

    // Remove existing notification (if any from previous manual system)
    const existing = document.querySelector(".add-to-cart-notification");
    if (existing) {
      existing.remove();
    }

    // Create notification
    const notification = document.createElement("div");
    notification.className = "add-to-cart-notification";
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(76, 175, 80, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="display: block;">
            <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" 
              stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px; color: white;">
            ${translatedAddedToCart}
          </div>
          <div style="font-size: 13px; opacity: 0.9; color: rgba(255,255,255,0.8);">
            ${quantity}x ${itemTitle}
          </div>
        </div>
        <a href="../cartpage/" style="
          padding: 8px 16px;
          background: white;
          color: #4CAF50;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.9)'" 
           onmouseout="this.style.background='white'">
          ${translatedViewCart}
        </a>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 24px;
      z-index: 99999;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(56, 142, 60, 0.95));
      color: white;
      border-radius: 12px;
      font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
      font-size: 14px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(76, 175, 80, 0.4);
      animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 400px;
      min-width: 320px;
      backdrop-filter: blur(10px);
    `;

    // Add animation keyframes if not exists
    if (!document.getElementById("add-to-cart-animations")) {
      const style = document.createElement("style");
      style.id = "add-to-cart-animations";
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
      notification.style.animation =
        "slideOutRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards";
      setTimeout(() => notification.remove(), 300);
    }, 4000);

    // Add close on click
    notification.addEventListener("click", (e) => {
      if (e.target.tagName !== "A") {
        notification.style.animation =
          "slideOutRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        setTimeout(() => notification.remove(), 300);
      }
    });

    // console.log(`Added ${quantity}x "${itemTitle}" to cart`);
  }

  /* ========================================
   * DETERMINE PAIRING REASON
   * Logic to determine why items pair well
   * ======================================== */

  function determinePairingReason(currentItem, pairedItem) {
    const reasons = {
      sameCategory: "product_detail_page.pairing_reasons.same_category",
      spiceBalance: "product_detail_page.pairing_reasons.spice_balance",
      dietaryMatch: "product_detail_page.pairing_reasons.dietary_match",
      contrastTexture: "product_detail_page.pairing_reasons.contrast_texture",
      chefPick: "product_detail_page.pairing_reasons.chef_pick",
      popularCombo: "product_detail_page.pairing_reasons.popular_combo",
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
    // console.log("  --- createMealPairingSection called ---");
    // Check if item has pairing suggestions
    if (!item.pairsWith || item.pairsWith.length === 0) {
      // console.log("    No pairing suggestions for this item.");
      return;
    }

    // Get pairing items
    const pairingItems = item.pairsWith
      .map((pairId) => {
        const pairedItem = findItemById(pairId);
        if (!pairedItem) {
          // console.warn(`    Paired item with ID ${pairId} not found.`);
          return null;
        }

        return {
          ...pairedItem,
          pairingReason: determinePairingReason(item, pairedItem),
        };
      })
      .filter(Boolean);

    // If no valid pairings, return
    if (pairingItems.length === 0) {
      // console.log("    No valid pairing items found.");
      return;
    }

    // Find where to insert (after badges or description)
    const descElement = document.querySelector(".product-detail__container");
    const badgesElement = document.querySelector(".product-detail__container");
    const insertAfter = badgesElement || descElement;

    if (!insertAfter) return;

    // Check if pairing section already exists
    if (document.querySelector(".meal-pairing")) return;

    // Create pairing section
    const pairingSection = document.createElement("div");
    pairingSection.className = "meal-pairing";

    // Create header
    const header = document.createElement("div");
    header.className = "meal-pairing__header";
    header.style.cssText = `
      margin-bottom: 1.5rem;
      text-align: center;
    `;
    const pairingTitleKey = "product_detail_page.pairing_section.title";
    const pairingSubtitleKey = "product_detail_page.pairing_section.subtitle";
    header.innerHTML = `
      <h2 data-i18n="product_detail_page.pairing_section.title">${i18nService.t(
        pairingTitleKey
      )}</h2>
      <p data-i18n="product_detail_page.pairing_section.subtitle">${i18nService.t(
        pairingSubtitleKey
      )}</p>
    `;
    // console.log(
    //   `    Pairing Section Title Key: ${pairingTitleKey}, Translated: ${i18nService.t(
    //     pairingTitleKey
    //   )}`
    // );
    // console.log(
    //   `    Pairing Section Subtitle Key: ${pairingSubtitleKey}, Translated: ${i18nService.t(
    //     pairingSubtitleKey
    //   )}`
    // );

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

    // Add subtle entrance animation
    setTimeout(() => {
      pairingSection.classList.add("animate-in");
    }, 0);

    // Remove animation class after completion
    setTimeout(() => {
      pairingSection.classList.remove("animate-in");
    }, 600);
  }

  /* ========================================
   * CREATE PAIRING CARD
   * Individual card for paired item
   * ======================================== */

  function createPairingCard(item) {
    // console.log("  --- createPairingCard called ---");
    const card = document.createElement("article");
    card.className = "pairing-card";

    // Add click handler with global loader transition
    card.addEventListener("click", (e) => {
      e.preventDefault();

      // Show global loader with item name
      if (window.GlobalLoader) {
        const loadingProductKey = "product_detail_page.loading_product";
        const itemTitleKey = item.title;
        const translatedLoadingProduct = i18nService.t(loadingProductKey);
        const translatedItemTitle = i18nService.t(itemTitleKey);
        window.GlobalLoader.show(
          `${translatedLoadingProduct} ${translatedItemTitle}...`
        );
        // console.log(
        //   `    Loading Product Message: ${translatedLoadingProduct} ${translatedItemTitle}...`
        // );
      }

      // Navigate after brief delay
      setTimeout(() => {
        window.location.href = `./index.html?id=${item.id}`;
      }, 300);
    });

    // Image
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "pairing-card__img-wrapper";

    const img = document.createElement("img");
    img.src = item.image;
    const itemTitleKey = item.title;
    const translatedItemTitle = i18nService.t(itemTitleKey);
    img.alt = translatedItemTitle;
    // console.log(
    //   `    Pairing Card Image Alt Key: ${itemTitleKey}, Translated: ${translatedItemTitle}`
    // );
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease;
      will-change: transform;
      backface-visibility: hidden;
    `;

    card.addEventListener("mouseenter", () => {
      img.style.transform = "scale(1.15) rotate(2deg)";
      img.style.filter = "brightness(1.1) saturate(1.2)";
    });

    card.addEventListener("mouseleave", () => {
      img.style.transform = "scale(1) rotate(0)";
      img.style.filter = "brightness(1) saturate(1)";
    });

    imgWrapper.appendChild(img);

    // Title
    const title = document.createElement("h3");
    const cardTitleKey = item.title;
    const translatedCardTitle = i18nService.t(cardTitleKey);
    title.textContent = translatedCardTitle;
    // console.log(
    //   `    Pairing Card Title Key: ${cardTitleKey}, Translated: ${translatedCardTitle}`
    // );
    title.style.cssText = `
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 500;
      margin: 0 0 0.5rem 0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: left center;
    `;

    card.addEventListener("mouseenter", () => {
      title.style.color = "var(--color-dark-orange)";
      title.style.transform = "translateX(5px)";
      title.style.textShadow = "0 0 20px rgba(251, 143, 44, 0.6)";
    });

    card.addEventListener("mouseleave", () => {
      title.style.color = ""; // Reset to default or CSS defined
      title.style.transform = "translateX(0)";
      title.style.textShadow = "none";
    });

    // Description (truncated)
    const desc = document.createElement("p");
    const descKey = item.desc;
    const translatedDesc = i18nService.t(descKey);
    desc.textContent =
      translatedDesc.length > 50
        ? translatedDesc.substring(0, 50) + "..."
        : translatedDesc;
    // console.log(
    //   `    Pairing Card Description Key: ${descKey}, Translated: ${translatedDesc}`
    // );
    desc.style.cssText = `
      font-family: var(--font-body);
      font-size: 0.75rem;
      margin: 0 0 0.75rem 0;
      line-height: 1.4;
    `;

    // Pairing reason
    const reason = document.createElement("div");
    reason.className = "pairing-card__reason";

    const reasonIcon = document.createElement("span");
    reasonIcon.textContent = "💡";
    reasonIcon.className = "pairing-card__reason-icon";

    const reasonText = document.createElement("p");
    const pairingReasonKey = item.pairingReason;
    const translatedPairingReason = i18nService.t(pairingReasonKey);
    reasonText.textContent = translatedPairingReason;
    // console.log(
    //   `    Pairing Reason Key: ${pairingReasonKey}, Translated: ${translatedPairingReason}`
    // );
    reasonText.style.cssText = `
      font-family: var(--font-body);
      font-size: 0.7rem;
      font-style: italic;
      margin: 0;
      line-height: 1.3;
    `;

    reason.appendChild(reasonIcon);
    reason.appendChild(reasonText);

    // Price
    const price = document.createElement("span");
    price.textContent = formatPrice(item.price);
    price.className = "pairing-card__price";

    // Assemble card
    card.appendChild(imgWrapper);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(reason);
    card.appendChild(price);

    // Add staggered entrance animation
    card.classList.add("animate-in");

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
        " data-i18n="product_detail_page.error_message.title">Product Not Found</h2>
        <p style="margin-bottom: 2rem;" data-i18n="product_detail_page.error_message.description">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <a href="../menupage/index.html" class="btn btn--primary" data-i18n="product_detail_page.error_message.back_to_menu">
          Back to Menu
        </a>
      </div>
    `;
  }

  /* ========================================
   * LOAD PRODUCT DETAILS
   * ======================================== */

  function loadProductDetails() {
    // console.log("--- loadProductDetails called ---");
    // console.log(
    //   "i18nService translations state:",
    //   Object.keys(i18nService.getTranslations()).length > 0
    //     ? "Loaded"
    //     : "Not Loaded"
    // );

    // Get item ID from URL
    const itemId = getUrlParameter("id");

    // If no ID provided, show default or first item
    if (!itemId) {
      // console.warn("No product ID provided, showing default product");
      // You could redirect to menu or show first item
      // For now, we'll just keep the static content
      return;
    }

    // Find item by ID
    const item = findItemById(itemId);

    // If item not found, show error
    if (!item) {
      // console.error(`Product with ID ${itemId} not found`);
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

    // console.log(`Loaded product: ${item.title} (ID: ${item.id})`);
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  // Listen for language changes to re-render the UI
  document.addEventListener("language-changed", loadProductDetails);

  // Handle initial load
  (async () => {
    await i18nService.init();
    loadProductDetails();
  })();
})();
