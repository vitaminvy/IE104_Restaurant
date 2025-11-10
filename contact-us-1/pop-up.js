document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openPopupBtn");
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("closePopupBtn");

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
