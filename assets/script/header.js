// ================================
// HEADER LOGIC (safe for partials)
// ================================
(function () {
  let menuInited = false;
  let scrollInited = false;
  let clockStarted = false;

  // ----- HELPERS -----
  function q(sel) { return document.querySelector(sel); }
  function hasHeader() { return !!document.getElementById("header"); }

  // ----- TOGGLE MENU -----
  function initMenu() {
    if (menuInited) return;
    const menuBtn = q(".header__menu-btn");
    const nav = q(".header__nav");
    if (!menuBtn || !nav) return;

    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("header__nav--open");
    });

    nav.addEventListener("click", (e) => {
      if (e.target === nav) nav.classList.remove("header__nav--open");
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        nav.classList.remove("header__nav--open");
      }
    });

    menuInited = true;
  }

  // ----- SCROLL STYLE (blur/bg mờ khi cuộn) -----
  function initScrollStyle() {
    if (scrollInited) return;
    const header = document.getElementById("header");
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 50) header.classList.add("header--scrolled");
      else header.classList.remove("header--scrolled");
    };
    window.addEventListener("scroll", onScroll);
    onScroll(); // set trạng thái ban đầu

    scrollInited = true;
  }

  // ----- CLOCK -----
  function updateTime() {
    const now = new Date();
    const fmtDay = new Intl.DateTimeFormat(navigator.language || "en-US", {
      weekday: "long",
    }).format(now);
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const el = document.getElementById("current-time");
    if (el) el.textContent = `${fmtDay} ${hh}:${mm}`;
  }

  function startClockIfReady() {
    if (clockStarted) return;
    const el = document.getElementById("current-time");
    if (!el) return;
    clockStarted = true;
    updateTime();
    setInterval(updateTime, 60_000);
  }

  // ----- OBSERVER: chờ header partial được inject -----
  const observer = new MutationObserver(() => {
    if (!hasHeader()) return;
    // Khi header xuất hiện, init tất cả rồi có thể ngắt observer
    initMenu();
    initScrollStyle();
    startClockIfReady();
    // nếu cả 3 đã sẵn sàng thì disconnect
    if (menuInited && scrollInited && clockStarted) observer.disconnect();
  });

  function boot() {
    // thử init ngay nếu header đã có
    if (hasHeader()) {
      initMenu();
      initScrollStyle();
      startClockIfReady();
    }
    // nếu chưa đủ thì quan sát DOM để chờ partial
    if (!(menuInited && scrollInited && clockStarted)) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  // DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Nếu includePartials.js có bắn sự kiện này, mình cũng bắt vào cho chắc
  document.addEventListener("partials:loaded", () => {
    initMenu();
    initScrollStyle();
    startClockIfReady();
  });
})();