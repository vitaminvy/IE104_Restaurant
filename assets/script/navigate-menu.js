import { menuItems } from "../data/mockdata.js";
import i18nService from "./i18n-service.js";

// MENU SLIDER NAVIGATION  (Slide by group: 1–2–3 cards)

// IIFE to avoid polluting global scope
(function () {
  //  DOM ELEMENTS
  const menuGrid = document.querySelector(".menu__grid");
  const leftArrow = document.querySelector(".menu__arrow--left");
  const rightArrow = document.querySelector(".menu__arrow--right");
  const dots = document.querySelectorAll(".menu__dot");
  const filterItems = document.querySelectorAll(".menu__filter-item");

  // STATE VARIABLES
  let currentIndex = 0; // current page index (0-based)
  let cardsPerView = 1; // number of cards visible per slide
  let cards = [];

  let totalCards = 0;

  // Cache layout values to prevent forced reflows
  let cachedCardWidth = 0;
  let cachedGap = 0;

  // CREATE CARD HTML
  function createCardHTML(item) {
    return `
        <article class="menu__card" data-item-id="${
          item.id
        }" data-item-title="${i18nService.t(item.title)}" data-item-price="${
      item.price
    }" data-item-image="${item.image}" style="cursor: pointer;">
            <div class="menu__card-img-wrapper">
                <img src="${item.image}" alt="${i18nService.t(
      item.title
    )}" class="menu__card-image" />
            </div>
            <h3 class="menu__card-title">${i18nService.t(item.title)}</h3>
            <p class="menu__card-desc">${i18nService.t(item.desc)}</p>
            <div class="menu__card-footer">
                <span class="menu__card-price">$${item.price}</span>
                <div class="menu__card-btn" style="pointer-events: none;">
                    ${i18nService.t("menu_page.order_now_button")}
                    <svg class="menu__card-btn-icon" width="21" height="10" viewBox="0 0 21 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5H20M20 5C18.5606 4.78667 15.6818 3.688 15.6818 1M20 5C18.5606 5.21333 15.6818 6.312 15.6818 9" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
            </div>
        </article>`;
  }

  // RENDER MENU BY CATEGORY
  function renderMenu(category) {
    const filtered =
      category === "all"
        ? menuItems
        : menuItems.filter((item) => item.category === category);

    menuGrid.innerHTML = filtered.map(createCardHTML).join("");
    cards = Array.from(menuGrid.querySelectorAll(".menu__card"));
    totalCards = cards.length;
    currentIndex = 0;

    // Setup card click handlers after rendering
    setupCardClickHandlers();
  }

  // SETUP CARD CLICK HANDLERS
  function setupCardClickHandlers() {
    const cards = menuGrid.querySelectorAll(".menu__card");

    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();

        const itemId = Number(card.dataset.itemId);
        const item = menuItems.find((menuItem) => menuItem.id == itemId);
        if (!item) return;

        // Get title and desc from the DOM to avoid race condition
        const title =
          card.querySelector(".menu__card-title")?.textContent ||
          i18nService.t(item.title);
        const desc =
          card.querySelector(".menu__card-desc")?.textContent ||
          i18nService.t(item.desc);

        const cartItem = { ...item, title, desc };
        addToCartAndNavigate(cartItem);
      });
    });
  }

  // ADD TO CART AND NAVIGATE
  function addToCartAndNavigate(item) {
    // Show loader
    if (window.GlobalLoader) {
      window.GlobalLoader.show("Adding to cart...");
    }

    // Get existing cart or create new
    let cart = [];
    try {
      const cartData = localStorage.getItem("restaurantCart");
      if (cartData) {
        cart = JSON.parse(cartData);
      }
    } catch (e) {
      // console.error("Error reading cart:", e);
    }

    // Check if item already in cart
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex > -1) {
      // Item exists, increase quantity
      cart[existingItemIndex].quantity =
        (cart[existingItemIndex].quantity || 1) + 1;
    } else {
      // Add new item
      cart.push({
        id: item.id,
        title: item.title, // Already translated from DOM
        price: item.price,
        image: item.image,
        desc: item.desc || "", // Already translated from DOM
        quantity: 1,
      });
    }

    // Save to localStorage
    try {
      localStorage.setItem("restaurantCart", JSON.stringify(cart));
    // console.log("Item added to cart:", item.title);
  } catch (e) {
    // console.error("Error saving cart:", e);
  }

    // Update loader message
    if (window.GlobalLoader) {
      window.GlobalLoader.updateMessage("Redirecting to cart...");
    }

    // Navigate to cart page after delay
    setTimeout(() => {
      window.location.href = "/cartpage/";
    }, 500);
  }

  // RESPONSIVE CARD COUNT
  // decide how many cards show per view depending on screen width
  function updateCardsPerView() {
    const width = window.innerWidth;

    // large desktop 3 cards, table 2 cards, mobile 1 card
    if (width >= 1024) {
      cardsPerView = 3;
    } else if (width >= 768) {
      cardsPerView = 2;
    } else {
      cardsPerView = 1;
    }

    // Reset slider to first page on resize
    currentIndex = 0;
    updateLayoutCache(); // Update cache before slider
    updateSlider();
    updateDots();
  }

  // TOTAL PAGE COUNT
  // calculate how many pages exist based on cardsPerView
  // use for indicators (ex: 9 card ->  3 pages if 3 cards view)
  function getTotalPages() {
    return Math.ceil(totalCards / cardsPerView);
  }

  // UPDATE LAYOUT CACHE
  // Separate read operations to prevent forced reflows
  function updateLayoutCache() {
    if (!cards.length) return;
    // Batch all layout reads together
    cachedCardWidth = cards[0].offsetWidth;
    cachedGap = parseFloat(getComputedStyle(menuGrid).gap) || 0;
  }

  // UPDATE SLIDER POSITION
  // move the grid using translateX
  function updateSlider() {
    if (!cards.length) {
      menuGrid.style.transform = "translateX(0)";
      updateArrowStates();
      return;
    }

    // Use cached values to avoid forced reflow
    const cardWidth = cachedCardWidth;
    const gap = cachedGap;

    // Each page translates by (cardsPerView * (cardWidth + gap))
    const translateX = -(currentIndex * cardsPerView * (cardWidth + gap));

    menuGrid.style.transform = `translateX(${translateX}px)`;
    menuGrid.style.transition = "transform 0.4s ease-in-out";

    updateArrowStates();
  }

  //  UPDATE ARROW STATES
  // when at start/end -> disable the arrow
  function updateArrowStates() {
    const totalPages = getTotalPages();

    // Left arrow (disabled on first page)
    if (leftArrow) {
      const atStart = currentIndex <= 0;
      leftArrow.style.opacity = atStart ? "0.3" : "1";
      leftArrow.style.pointerEvents = atStart ? "none" : "auto";
    }

    // Right arrow (disabled on last page)
    if (rightArrow) {
      const atEnd = currentIndex >= totalPages - 1;
      rightArrow.style.opacity = atEnd ? "0.3" : "1";
      rightArrow.style.pointerEvents = atEnd ? "none" : "auto";
    }
  }

  // UPDATE DOT NAVIGATION
  // highlight the active dot & show correct amount of dots
  function updateDots() {
    const totalPages = getTotalPages();

    dots.forEach((dot, index) => {
      if (index < totalPages) {
        dot.style.display = "block";
        const isActive = index === currentIndex;
        dot.classList.toggle("menu__dot--active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      } else {
        dot.style.display = "none";
      }
    });
  }

  // 8. NAVIGATION FUNCTIONS
  // go to previous group
  function goToPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
      updateDots();
    }
  }

  // go to next group
  function goToNext() {
    const totalPages = getTotalPages();
    if (currentIndex < totalPages - 1) {
      currentIndex++;
      updateSlider();
      updateDots();
    }
  }

  // go directly to a specific page (used for dots)
  // in mobile show only 1 dot for 1 card
  function goToSlide(pageIndex) {
    const totalPages = getTotalPages();
    currentIndex = Math.min(Math.max(0, pageIndex), totalPages - 1);
    updateSlider();
    updateDots();
  }

  // EVENT LISTENERS
  // --- Filter items ---
  function setActiveFilter(target) {
    filterItems.forEach((item) => {
      const isActive = item === target;
      item.classList.toggle("menu__filter-item--active", isActive);
      item.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  filterItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      if (item.classList.contains("menu__filter-item--active")) return;
      setActiveFilter(item);

      const category = item.dataset.category;
      renderMenu(category);
      updateCardsPerView();
      updateDots();
      updateLayoutCache(); // Update cache before slider
      updateSlider();
    });
  });

  // --- Arrow buttons ---
  leftArrow?.addEventListener("click", goToPrev);
  rightArrow?.addEventListener("click", goToNext);

  // --- Dot navigation ---
  dots.forEach((dot, index) =>
    dot.addEventListener("click", () => goToSlide(index))
  );

  // --- Keyboard support (left/right arrow keys) ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goToPrev();
    if (e.key === "ArrowRight") goToNext();
  });

  // --- responsive resize (debounce) ---
  // wait 250ms after resize to avide call "updateCardsPerView" too oftenr
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateCardsPerView, 250);
  });

  // TOUCH / SWIPE SUPPORT
  // works for mobile drag gestures
  let touchStartX = 0;
  let touchEndX = 0;

  menuGrid.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  menuGrid.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );

  function handleSwipe() {
    const swipeThreshold = 50; // Minimum px to trigger slide

    if (touchStartX - touchEndX > swipeThreshold) {
      goToNext(); // Swipe left → next slide
    } else if (touchEndX - touchStartX > swipeThreshold) {
      goToPrev(); // Swipe right → previous slide
    }
  }

  //INITIALIZATION
  const initiallyActive = document.querySelector(".menu__filter-item--active");
  const defaultCategory = initiallyActive?.dataset.category || "breakfast";

  if (initiallyActive) {
    setActiveFilter(initiallyActive);
  }

  renderMenu(defaultCategory);
  updateCardsPerView();
  updateDots();
  updateLayoutCache(); // Update cache before slider
  updateSlider();

  document.addEventListener("language-changed", () => {
    const activeFilter = document.querySelector(".menu__filter-item--active");
    const category = activeFilter?.dataset.category || "breakfast";
    renderMenu(category);
    updateCardsPerView();
    updateDots();
    updateLayoutCache(); // Update cache before slider
    updateSlider();
  });
})();
