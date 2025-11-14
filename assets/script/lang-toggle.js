// Simple i18n toggler: EN <-> VI
(() => {
  const STORAGE_KEY = 'lang';
  const DEFAULT_LANG = localStorage.getItem(STORAGE_KEY) || 'en';

  // Element updater for textContent
  function applyTranslations(dict) {
    // Normal text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const val = getByPath(dict, key);
      if (val != null) el.innerHTML = val; // allow <br/> in values
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getByPath(dict, key);
      if (val != null) el.setAttribute('placeholder', val);
    });

    // Document lang attr
    document.documentElement.setAttribute('lang', currentLang);
  }

  // Helper to get nested key: "a.b.c"
  function getByPath(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);
  }

  // Cache translations in-memory
  const cache = {};
  let currentLang = DEFAULT_LANG;

  async function load(lang) {
    if (!cache[lang]) {
      const res = await fetch(`/assets/lang/${lang}.json`, { cache: 'no-cache' });
      cache[lang] = await res.json();
    }
    applyTranslations(cache[lang]);
    localStorage.setItem(STORAGE_KEY, lang);
    updateFloatingToggle(lang);
  }

  // Floating toggle button (khỏi phải đụng vào partial header)
  function ensureFloatingToggle() {
    if (document.getElementById('lang-toggle-floating')) return;
    const btn = document.createElement('button');
    btn.id = 'lang-toggle-floating';
    btn.style.position = 'fixed';
    btn.style.top = '14px';
    btn.style.right = '14px';
    btn.style.zIndex = '9999';
    btn.style.padding = '0'; /* Remove padding to let image control size */
    btn.style.border = 'none'; /* Remove border */
    btn.style.borderRadius = '50%'; /* Make it circular */
    btn.style.background = 'transparent'; /* Transparent background */
    btn.style.cursor = 'pointer';
    btn.style.width = '32px'; /* Set a fixed size for the button */
    btn.style.height = '32px';
    btn.style.overflow = 'hidden'; /* Hide overflow for circular shape */
    btn.setAttribute('aria-label', 'Switch language');

    const flagImg = document.createElement('img');
    flagImg.id = 'lang-toggle-flag';
    flagImg.style.width = '100%';
    flagImg.style.height = '100%';
    flagImg.style.objectFit = 'cover'; /* Ensure image covers the button area */
    flagImg.style.borderRadius = '50%'; /* Apply border-radius to the image as well */
    btn.appendChild(flagImg);

    btn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'vi' : 'en';
      load(currentLang);
    });
    document.body.appendChild(btn);
    updateFloatingToggle(currentLang);
  }

  function updateFloatingToggle(lang) {
    const flagImg = document.getElementById('lang-toggle-flag');
    if (flagImg) {
      const flagSrc = lang === 'en' ? '/assets/icons/united-kingdom.png' : '/assets/icons/vietnam.png';
      const flagAlt = lang === 'en' ? 'English' : 'Vietnamese';
      flagImg.src = flagSrc;
      flagImg.alt = flagAlt;
    }
  }

  // Function to handle responsive visibility
  function handleResponsiveToggle() {
    const btn = document.getElementById('lang-toggle-floating');
    if (btn) {
      // Tailwind's md breakpoint is 768px
      if (window.innerWidth < 768) {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'block';
      }
    }
  }

  // Init when DOM ready
  if (document.readyState !== 'loading') {
    ensureFloatingToggle();
    load(currentLang);
    handleResponsiveToggle(); // Set initial state
    window.addEventListener('resize', handleResponsiveToggle); // Update on resize
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      ensureFloatingToggle();
      load(currentLang);
      handleResponsiveToggle(); // Set initial state
      window.addEventListener('resize', handleResponsiveToggle); // Update on resize
    });
  }
})();
