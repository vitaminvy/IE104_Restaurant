import i18nService from './i18n-service.js';

(() => {
  // Helper to get nested key: "a.b.c"
  function getByPath(obj, path) {
    if (!path) return undefined;
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  // Element updater for textContent
  function applyStaticTranslations() {
    const lang = i18nService.getLanguage();
    const translations = i18nService.getTranslations();

    if (Object.keys(translations).length === 0) {
      // Translations not loaded yet, wait for the event
      return;
    }

    // Normal text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getByPath(translations, key);
      if (val !== undefined) el.innerHTML = val; // allow <br/> in values
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getByPath(translations, key);
      if (val !== undefined) el.setAttribute('placeholder', val);
    });

    // Document lang attr
    document.documentElement.setAttribute('lang', lang);
  }

  // Floating toggle button
  function ensureFloatingToggle() {
    if (document.getElementById('lang-toggle-floating')) return;
    const btn = document.createElement('button');
    btn.id = 'lang-toggle-floating';
    btn.style.position = 'fixed';
    btn.style.top = '28px';
    btn.style.right = '14px';
    btn.style.zIndex = '9999';
    btn.style.padding = '0';
    btn.style.border = 'none';
    btn.style.background = 'transparent';
    btn.style.cursor = 'pointer';
    btn.style.width = '32px';
    btn.style.height = '32px';
    btn.setAttribute('aria-label', 'Switch language');

    const flagImg = document.createElement('img');
    flagImg.id = 'lang-toggle-flag';
    flagImg.style.width = '100%';
    flagImg.style.height = '100%';
    flagImg.style.objectFit = 'cover';
    btn.appendChild(flagImg);

    btn.addEventListener('click', () => {
      const newLang = i18nService.getLanguage() === 'en' ? 'vi' : 'en';
      i18nService.setLanguage(newLang);
    });
    document.body.appendChild(btn);
    updateFloatingToggle(i18nService.getLanguage());
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

  function handleResponsiveToggle() {
    const btn = document.getElementById('lang-toggle-floating');
    if (btn) {
      if (window.innerWidth < 1025) {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'block';
      }
    }
  }

  // Listen for language changes to update static text and the toggle icon
  document.addEventListener('language-changed', () => {
    const newLang = i18nService.getLanguage();
    applyStaticTranslations();
    updateFloatingToggle(newLang);
  });

  // Init when DOM ready
  function initialize() {
    ensureFloatingToggle();
    applyStaticTranslations();
    handleResponsiveToggle();
    window.addEventListener('resize', handleResponsiveToggle);
  }

  if (document.readyState !== 'loading') {
    initialize();
  } else {
    document.addEventListener('DOMContentLoaded', initialize);
  }
})();

