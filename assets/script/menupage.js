// /assets/script/menupage.js
import { menuItems } from "../data/mockdata.js";


(function syncHeaderHeight() {
  const root = document.documentElement;
  function apply() {
    const header = document.getElementById("header");
    if (!header) return;
    const h = Math.round(header.getBoundingClientRect().height);
    root.style.setProperty("--header-height", `${h}px`);
  }
  window.addEventListener("load", apply);
  window.addEventListener("resize", () => requestAnimationFrame(apply));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(apply).catch(() => {});
  }
  apply();
})();

(function () {
  const container = document.getElementById("menu-card-container");
  const tabs = document.querySelectorAll(".menu__filter-item");
  let current = document.querySelector(".menu__filter-item--active")?.dataset.category || "breakfast";

  const formatPrice = (p) => p.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const cardTemplate = (item) => `
    <article class="menu__card">
      <div class="menu__card-img-wrapper">
        <img src="${item.image}" alt="${item.title}" class="menu__card-image" loading="lazy"/>
      </div>
      <div class="menu__card-content">
        <h3 class="menu__card-title">${item.title}</h3>
        <p class="menu__card-desc">${item.desc}</p>
        <div class="menu__card-meta">
          <span class="menu__card-price">${formatPrice(item.price)}</span>
          <button class="menu__card-btn">Order Now →</button>
        </div>
      </div>
    </article>`;

  function render() {
    const data = current === "all" ? menuItems : menuItems.filter(x => x.category === current);
    container.innerHTML = data.map(cardTemplate).join("");
  }

  tabs.forEach(t => t.addEventListener("click", e => {
    e.preventDefault();
    tabs.forEach(x => x.classList.remove("menu__filter-item--active"));
    t.classList.add("menu__filter-item--active");
    current = t.dataset.category || "breakfast";
    render();
  }));

  render();
})();