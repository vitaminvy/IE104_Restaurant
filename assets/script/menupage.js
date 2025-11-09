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
(function rippleOnClick(){
  const root = document.getElementById("menu-card-container");
  if(!root) return;
  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".menu__card-btn");
    if(!btn) return;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement("span");
    r.className = "ripple";
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + "px";
    r.style.left = (e.clientX - rect.left - size/2) + "px";
    r.style.top  = (e.clientY - rect.top  - size/2) + "px";
    btn.appendChild(r);
    r.addEventListener("animationend", () => r.remove());
  });
})();

// Toast helper
(function setupToast(){
  let root = document.getElementById("toast-root");
  if(!root){
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  window.showToast = function(message, type = "success", duration = 1800){
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    const msg = document.createElement("span");
    msg.textContent = message;
    const close = document.createElement("span");
    close.className = "toast__close";
    close.setAttribute("role","button");
    close.setAttribute("aria-label","Close");
    close.textContent = "×";
    close.onclick = () => dismiss();
    el.appendChild(close);
    el.appendChild(msg);
    root.appendChild(el);

    requestAnimationFrame(()=> el.classList.add("is-visible"));

    const t = setTimeout(dismiss, duration);
    function dismiss(){
      clearTimeout(t);
      el.classList.remove("is-visible");
      el.addEventListener("transitionend", ()=> el.remove(), { once:true });
    }
  };
})();

(function bindToastOnOrder(){
  const root = document.getElementById("menu-card-container");
  if (!root) return;
  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".menu__card-btn");
    if (!btn) return;
    const card  = btn.closest(".menu__card");
    const title = (card?.querySelector(".menu__card-title")?.textContent || "Item").trim();
    if (typeof window.showToast === "function") {
      window.showToast(`Added “${title}” to cart`, "success", 1800);
    }
  });
})();