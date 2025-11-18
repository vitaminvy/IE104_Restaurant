import i18nService from './i18n-service.js';
// ================================
// HEADER LOGIC (safe for partials)
// ================================
(function () {
  let menuInited = false;
  let scrollInited = false;
  let clockStarted = false;

  // ----- HELPERS -----
  function q(sel) {
    return document.querySelector(sel);
  }
  function hasHeader() {
    return !!document.getElementById("header");
  }

  // ----- TOGGLE MENU -----
  function initMenu() {
    if (menuInited) return;
    const menuBtn = q(".header__menu-btn");
    const nav = q(".header__nav");
    if (!menuBtn || !nav) return;

    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("header__nav--open");
      document.body.classList.toggle("mobile-nav-open");
    });

    nav.addEventListener("click", (e) => {
      if (e.target === nav) {
        nav.classList.remove("header__nav--open");
        document.body.classList.remove("mobile-nav-open");
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        nav.classList.remove("header__nav--open");
        document.body.classList.remove("mobile-nav-open");
      }
    });

    menuInited = true;
  }

  function initScrollStyle() {
    if (scrollInited) return;
    const header = document.getElementById("header");
    if (!header) return;

    let scrollTicking = false;
    let resizeTimer;

    const animateStickyTransition = (duration) => {
      const startTime = performance.now();

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;

        adjustStickyElementsPosition();

        if (elapsed < duration) {
          requestAnimationFrame(step);
        } else {
          adjustStickyElementsPosition();
        }
      };

      requestAnimationFrame(step);
    };

    const onScroll = () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const isScrolled = currentScrollY > 50;

          const hasClass = header.classList.contains("header--scrolled");

          if (isScrolled !== hasClass) {
            if (isScrolled) {
              header.classList.add("header--scrolled");
            } else {
              header.classList.remove("header--scrolled");
            }

            animateStickyTransition(310);
          }

          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(adjustStickyElementsPosition, 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();
    adjustStickyElementsPosition(); // Initial adjustment

    scrollInited = true;
  }

  // Function to adjust the top position of sticky elements (menu filter and cart icon)
  // Optimized to batch layout reads before writes to prevent forced reflows
  const adjustStickyElementsPosition = () => {
    const header = document.getElementById("header");
    const menuFilter = q(".menu__filter");
    const cartIconWrapper = q(".cart-icon-wrapper");

    if (!header) return;

    // Batch all layout reads together first
    const headerHeight = header.offsetHeight;
    const menuFilterHeight = menuFilter ? menuFilter.offsetHeight : 0;
    const cartIconHeight = cartIconWrapper ? cartIconWrapper.offsetHeight : 0;

    // Then perform all writes
    if (menuFilter) {
      menuFilter.style.top = `${headerHeight}px`;

    }
    if (cartIconWrapper && menuFilter) {
      // Calculate top position to vertically center cart icon with menu filter
      const menuFilterCenter = headerHeight + menuFilterHeight / 2;
      const cartIconTop = menuFilterCenter - cartIconHeight / 2 + 3;
      cartIconWrapper.style.top = `${cartIconTop}px`;
    } else if (cartIconWrapper) {
      // Fallback if menuFilter is not found, position below header with a default offset
      cartIconWrapper.style.top = `${headerHeight + 20}px`;
    }
  };

  // ----- CLOCK -----
  function updateTime() {
    const now = new Date();
    const dayIndex = now.getDay();
    const fmtDay = i18nService.t(`weekdays.${dayIndex}`);
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

    i18nService.init().then(() => {
      updateTime();
      setInterval(updateTime, 60_000);
      document.addEventListener('language-changed', updateTime);
    });
  }

  // ----- SETUP NAVIGATION WITH LOADER -----
  function setupNavigationLoader() {
    const navLinks = document.querySelectorAll(".header__nav-link");
    if (!navLinks.length) return;

    navLinks.forEach((link) => {
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
    navLinks.forEach((link) => {
      link.classList.remove("header__nav-link--active");
    });

    // Check each link and set active based on current path
    navLinks.forEach((link) => {
      const linkPath = link.getAttribute("href");

      // Handle different path formats
      if (linkPath) {
        // Normalize paths for comparison
        const normalizedLinkPath = linkPath
          .replace(/^\/+/, "")
          .replace(/\/index\.html$/, "")
          .replace(/\/$/, "");
        const normalizedCurrentPath = currentPath
          .replace(/^\/+/, "")
          .replace(/\/index\.html$/, "")
          .replace(/\/$/, "");

        // Check for exact match or if current path starts with link path
        if (
          normalizedCurrentPath === normalizedLinkPath ||
          normalizedCurrentPath.startsWith(normalizedLinkPath + "/") ||
          (normalizedLinkPath === "homepage" &&
            (normalizedCurrentPath === "" ||
              normalizedCurrentPath === "homepage")) ||
          (normalizedLinkPath.includes("menupage") &&
            normalizedCurrentPath.includes("menupage")) ||
          (normalizedLinkPath.includes("blogpage") &&
            normalizedCurrentPath.includes("blogpage")) ||
          (normalizedLinkPath.includes("contact-us") &&
            normalizedCurrentPath.includes("contact-us")) ||
          (normalizedLinkPath.includes("coming-soon") &&
            normalizedCurrentPath.includes("coming-soon"))
        ) {
          link.classList.add("header__nav-link--active");
        }
      }
    });

    // If no link is active and we're on homepage/root, activate Home
    const hasActive = document.querySelector(".header__nav-link--active");
    if (
      !hasActive &&
      (currentPath === "/" ||
        currentPath === "" ||
        currentPath.includes("homepage"))
    ) {
      const homeLink = Array.from(navLinks).find(
        (link) =>
          link.getAttribute("href")?.includes("homepage") ||
          link.textContent.trim().toLowerCase() === "home"
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
