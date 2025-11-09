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