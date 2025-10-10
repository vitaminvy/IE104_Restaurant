document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".header__menu-btn");
  const nav = document.querySelector(".header__nav");

  // Toggle khi click vào icon
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("header__nav--open");
  });

  // Click ra ngoài (nếu click vào vùng nền tối)
  nav.addEventListener("click", (e) => {
    if (e.target === nav) {
      nav.classList.remove("header__nav--open");
    }
  });

  // Khi resize > desktop thì đóng
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      nav.classList.remove("header__nav--open");
    }
  });
});