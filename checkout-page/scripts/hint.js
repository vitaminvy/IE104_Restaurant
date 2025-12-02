// Logic: show hint of selected payment method
document.addEventListener("DOMContentLoaded", () => {
  const radios = document.querySelectorAll(".payment__radio");

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      // hide all previous hints
      document
        .querySelectorAll(".payment__hint")
        .forEach((hint) => (hint.style.display = "none"));

      // show hint of selected option
      const option = radio.closest(".payment__option");
      const hint = option?.querySelector(".payment__hint");
      if (hint) hint.style.display = "block";
    });
  });
});
