document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openPopupBtn");
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("closePopupBtn");

  // Move popup to body so it can escape section overflow & stacking contexts
  if (popup && popup.parentElement !== document.body) {
    document.body.appendChild(popup);
  }

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    popup.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === popup) popup.style.display = "none";
  });
});
