// product-detail.js
(function () {
  const minus = document.querySelector(".qty-btn.minus");
  const plus = document.querySelector(".qty-btn.plus");
  const input = document.querySelector(".qty-input");

  minus?.addEventListener("click", () => {
    const val = Math.max(1, parseInt(input.value || 1) - 1);
    input.value = val;
  });

  plus?.addEventListener("click", () => {
    const val = Math.min(99, parseInt(input.value || 1) + 1);
    input.value = val;
  });
})();

// product-tab.js
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".product-tab__btn");
  const contents = document.querySelectorAll("[data-tab-content]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // active tab
      tabs.forEach((t) => t.classList.remove("product-tab__btn--active"));
      tab.classList.add("product-tab__btn--active");

      // show content
      contents.forEach((c) => c.classList.add("hidden"));
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.remove("hidden");
    });
  });

  // handle stars in review form
  const stars = document.querySelectorAll(".review-form__rating .stars img");
  stars.forEach((star, i) => {
    star.addEventListener("click", () => {
      stars.forEach((s, idx) => {
        s.src =
          idx <= i
            ? "../assets/icons/product-detail-page/star-icon.svg"
            : "../assets/icons/product-detail-page/empty-star-icon.svg";
      });
    });
  });
});