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
    btn.style.padding = '6px 10px';
    btn.style.border = '1px solid #ccc';
    btn.style.borderRadius = '6px';
    btn.style.background = '#fff';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = '600';
    btn.setAttribute('aria-label', 'Switch language');
    btn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'vi' : 'en';
      load(currentLang);
    });
    document.body.appendChild(btn);
    updateFloatingToggle(currentLang);
  }

  function updateFloatingToggle(lang) {
    const btn = document.getElementById('lang-toggle-floating');
    if (btn) btn.textContent = lang === 'en' ? 'VI' : 'EN';
  }

  // Init when DOM ready
  if (document.readyState !== 'loading') {
    ensureFloatingToggle();
    load(currentLang);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      ensureFloatingToggle();
      load(currentLang);
    });
  }
})();