const i18nService = (() => {
  let translations = {};
  let currentLang = localStorage.getItem('language') || 'en';
  let initPromise;

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`../assets/lang/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${lang}.json`);
      }
      translations = await response.json();
      // console.log(`Translations for ${lang} loaded.`);
      // Dispatch event after loading any translation
      document.dispatchEvent(new CustomEvent('language-changed'));
    } catch (error) {
      // console.error('Error loading translations:', error);
      // Fallback to English if loading fails
      if (lang !== 'en') {
        await loadTranslations('en');
      }
    }
  }

  function t(key) {
    if (!key) return '';
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : key, translations);
  }

  function getTranslations() {
    return translations;
  }

  function getLanguage() {
    return currentLang;
  }

  function setLanguage(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem('language', lang);
    // No need to dispatch event here, loadTranslations will do it
    loadTranslations(lang);
  }

  function init() {
    if (!initPromise) {
      initPromise = loadTranslations(currentLang);
    }
    return initPromise;
  }

  return {
    init, // Expose the init function
    t,
    getTranslations,
    getLanguage,
    setLanguage,
  };
})();

export default i18nService;

if (typeof window !== 'undefined') {
  window.i18nService = i18nService;
}
