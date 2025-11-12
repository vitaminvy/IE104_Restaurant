// /assets/script/menupage.js
import { menuItems } from "../assets/data/mockdata.js";

(function () {
  const container = document.getElementById("menu-card-container");
  const tabs = document.querySelectorAll(".menu__filter-item");
  const paginationRoot = document.createElement("div");
  paginationRoot.className = "menu__pagination";
  container.after(paginationRoot);

  let current =
    document.querySelector(".menu__filter-item--active")?.dataset.category ||
    "breakfast";
  let currentPage = 1;
  const itemsPerPage = 12;

  const formatPrice = (p) =>
    p.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const cardTemplate = (item) => `
    <article class="menu__card" data-item-id="${item.id}" style="cursor: pointer;">
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
          <button class="menu__card-btn">Order Now +</button>
        </div>
      </div>
    </article>`;

  function getFilteredData() {
    return current === "all"
      ? menuItems
      : menuItems.filter((x) => x.category === current);
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      paginationRoot.innerHTML = "";
      return;
    }

    let buttons = [];
    const maxButtons = 5; // show 5 visible pages max
    const half = Math.floor(maxButtons / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    // first + prev
    buttons.push(
      `<button class="page-btn" data-page="first" ${
        currentPage === 1 ? "disabled" : ""
      }>«</button>`
    );
    buttons.push(
      `<button class="page-btn" data-page="prev" ${
        currentPage === 1 ? "disabled" : ""
      }>‹</button>`
    );

    if (start > 1) buttons.push(`<span class="page-dots">...</span>`);

    for (let i = start; i <= end; i++) {
      buttons.push(
        `<button class="page-btn ${
          i === currentPage ? "active" : ""
        }" data-page="${i}">${i}</button>`
      );
    }

    if (end < totalPages) buttons.push(`<span class="page-dots">...</span>`);

    // next + last
    buttons.push(
      `<button class="page-btn" data-page="next" ${
        currentPage === totalPages ? "disabled" : ""
      }>›</button>`
    );
    buttons.push(
      `<button class="page-btn" data-page="last" ${
        currentPage === totalPages ? "disabled" : ""
      }>»</button>`
    );

    paginationRoot.innerHTML = buttons.join("");

    paginationRoot.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.dataset.page;
        const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

        switch (action) {
          case "first":
            currentPage = 1;
            break;
          case "prev":
            currentPage = Math.max(1, currentPage - 1);
            break;
          case "next":
            currentPage = Math.min(totalPages, currentPage + 1);
            break;
          case "last":
            currentPage = totalPages;
            break;
          default:
            currentPage = parseInt(action);
            break;
        }

        render();
        window.scrollTo({ top: container.offsetTop - 80, behavior: "smooth" });
      });
    });
  }

  function render() {
    const data = getFilteredData();
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = data.slice(start, end);

    container.innerHTML = pageData.map(cardTemplate).join("");
    renderPagination(totalPages);
  }

  tabs.forEach((t) =>
    t.addEventListener("click", (e) => {
      e.preventDefault();
      tabs.forEach((x) => x.classList.remove("menu__filter-item--active"));
      t.classList.add("menu__filter-item--active");
      current = t.dataset.category || "breakfast";
      currentPage = 1;
      render();
    })
  );

  render();
})();

(function rippleOnClick() {
  const root = document.getElementById("menu-card-container");
  if (!root) return;
  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".menu__card-btn");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement("span");
    r.className = "ripple";
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + "px";
    r.style.left = e.clientX - rect.left - size / 2 + "px";
    r.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(r);
    r.addEventListener("animationend", () => r.remove());
  });
})();

// Toast helper
(function setupToast() {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  window.showToast = function (message, type = "success", duration = 1800) {
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    const msg = document.createElement("span");
    msg.textContent = message;
    const close = document.createElement("span");
    close.className = "toast__close";
    close.setAttribute("role", "button");
    close.setAttribute("aria-label", "Close");
    close.textContent = "×";
    close.onclick = () => dismiss();
    el.appendChild(close);
    el.appendChild(msg);
    root.appendChild(el);

    requestAnimationFrame(() => el.classList.add("is-visible"));

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

    // Navigate to product detail page with item ID
    window.location.href = `../product-detail-page/index.html?id=${itemId}`;
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
