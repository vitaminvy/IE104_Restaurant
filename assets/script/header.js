document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".header__menu-btn");
  const nav = document.querySelector(".header__nav");

  // tooggle menu
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("header__nav--open");
  });

  // click outside to quit menu
  nav.addEventListener("click", (e) => {
    if (e.target === nav) {
      nav.classList.remove("header__nav--open");
    }
  });

  // when resize -> close menu (in desktop mode)
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      nav.classList.remove("header__nav--open");
    }
  });
});

// chnage header style when scroll
window.addEventListener("scroll", () => {
  const header = document.getElementById("header")

  if (window.scrollY > 50) {
    header.classList.add("header--scrolled")
  } else {
    header.classList.remove("header--scrolled")
  }
})
