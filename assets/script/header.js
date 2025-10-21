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

// change header style when scroll
window.addEventListener("scroll", () => {
  const header = document.getElementById("header")

  if (window.scrollY > 50) {
    header.classList.add("header--scrolled")
  } else {
    header.classList.remove("header--scrolled")
  }
})

// update current time
function updateTime() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[now.getDay()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeElem = document.getElementById('current-time');
  if (timeElem) {
    timeElem.textContent = `${day} ${hours}:${minutes}`;
  }
}
updateTime();
setInterval(updateTime, 60000);
