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
    const menuFilter = q(".menu__filter"); // Get the menu filter element
    if (!header) return;

    // Function to adjust the menu filter's top position
    const adjustMenuFilterPosition = () => {
      if (menuFilter) {
        const headerHeight = header.offsetHeight; // Get computed height of the header
        menuFilter.style.top = `${headerHeight}px`;
      }
    };

    const onScroll = () => {
      if (window.scrollY > 50) header.classList.add("header--scrolled");
      else header.classList.remove("header--scrolled");
      adjustMenuFilterPosition(); // Adjust position on scroll
    };

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", adjustMenuFilterPosition); // Adjust position on resize
    onScroll(); // set trạng thái ban đầu và điều chỉnh vị trí ban đầu
    adjustMenuFilterPosition(); // Initial adjustment

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

  // ----- SETUP NAVIGATION WITH LOADER -----
  function setupNavigationLoader() {
    const navLinks = document.querySelectorAll(".header__nav-link");
    if (!navLinks.length) return;

    navLinks.forEach(link => {
      // Skip hash links (same page)
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      link.addEventListener("click", (e) => {
        e.preventDefault();

        // Get link text for message
        const linkText = link.textContent.trim();
        
        // Show global loader
        if (window.GlobalLoader) {
          window.GlobalLoader.show(`Loading ${linkText}...`);
        }

        // Navigate after brief delay
        setTimeout(() => {
          window.location.href = href;
        }, 200);
      });
    });
  }

  // ----- SET ACTIVE NAV LINK -----
  function setActiveNavLink() {
    const navLinks = document.querySelectorAll(".header__nav-link");
    if (!navLinks.length) return;

    // Get current page path
    const currentPath = window.location.pathname;
    
    // Remove all active classes first
    navLinks.forEach(link => {
      link.classList.remove("header__nav-link--active");
    });

    // Check each link and set active based on current path
    navLinks.forEach(link => {
      const linkPath = link.getAttribute("href");
      
      // Handle different path formats
      if (linkPath) {
        // Normalize paths for comparison
        const normalizedLinkPath = linkPath.replace(/^\/+/, '').replace(/\/index\.html$/, '').replace(/\/$/, '');
        const normalizedCurrentPath = currentPath.replace(/^\/+/, '').replace(/\/index\.html$/, '').replace(/\/$/, '');
        
        // Check for exact match or if current path starts with link path
        if (normalizedCurrentPath === normalizedLinkPath || 
            normalizedCurrentPath.startsWith(normalizedLinkPath + '/') ||
            (normalizedLinkPath === 'homepage' && (normalizedCurrentPath === '' || normalizedCurrentPath === 'homepage')) ||
            (normalizedLinkPath.includes('menupage') && normalizedCurrentPath.includes('menupage')) ||
            (normalizedLinkPath.includes('blogpage') && normalizedCurrentPath.includes('blogpage')) ||
            (normalizedLinkPath.includes('contact-us') && normalizedCurrentPath.includes('contact-us')) ||
            (normalizedLinkPath.includes('coming-soon') && normalizedCurrentPath.includes('coming-soon'))) {
          link.classList.add("header__nav-link--active");
        }
      }
    });

    // If no link is active and we're on homepage/root, activate Home
    const hasActive = document.querySelector(".header__nav-link--active");
    if (!hasActive && (currentPath === '/' || currentPath === '' || currentPath.includes('homepage'))) {
      const homeLink = Array.from(navLinks).find(link => 
        link.getAttribute("href")?.includes('homepage') || 
        link.textContent.trim().toLowerCase() === 'home'
      );
      if (homeLink) {
        homeLink.classList.add("header__nav-link--active");
      }
    }
  }

  // ----- OBSERVER: chờ header partial được inject -----
  const observer = new MutationObserver(() => {
    if (!hasHeader()) return;
    // Khi header xuất hiện, init tất cả rồi có thể ngắt observer
    initMenu();
    initScrollStyle();
    startClockIfReady();
    setActiveNavLink();
    setupNavigationLoader();
    // nếu cả 3 đã sẵn sàng thì disconnect
    if (menuInited && scrollInited && clockStarted) observer.disconnect();
  });

  function boot() {
    // thử init ngay nếu header đã có
    if (hasHeader()) {
      initMenu();
      initScrollStyle();
      startClockIfReady();
      setActiveNavLink();
      setupNavigationLoader();
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

  // Nếu include-partials.js có bắn sự kiện này, mình cũng bắt vào cho chắc
  document.addEventListener("partials:loaded", () => {
    initMenu();
    initScrollStyle();
    startClockIfReady();
    setActiveNavLink();
    setupNavigationLoader();
  });
})();