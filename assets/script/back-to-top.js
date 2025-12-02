document.addEventListener("includes-loaded", () => {
  const backToTopBtn = document.getElementById("backToTop");
  if (!backToTopBtn) return;

  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 300 && currentScroll > lastScroll) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }

    lastScroll = currentScroll;
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});
