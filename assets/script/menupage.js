// /assets/script/menupage.js
import { menuItems } from "../data/mockdata.js";

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
    <article class="menu__card">
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
          <a href="../product-detail-page/index.html" class="menu__card-btn">Order Now →</a>
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
