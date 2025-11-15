const i18nService = (() => {
  let translations = {};
  let currentLang = localStorage.getItem('language') || 'en';

  async function loadTranslations(lang, isInitialLoad = false) {
    try {
      const response = await fetch(`../assets/lang/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${lang}.json`);
      }
      translations = await response.json();
      console.log(`Translations for ${lang} loaded.`);
      if (isInitialLoad) {
        document.dispatchEvent(new CustomEvent('language-changed'));
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English if loading fails
      if (lang !== 'en') {
        await loadTranslations('en', isInitialLoad);
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
    loadTranslations(lang).then(() => {
      document.dispatchEvent(new CustomEvent('language-changed'));
    });
  }

  // Initial load
  loadTranslations(currentLang, true);

  return {
    loadTranslations,
    t,
    getTranslations,
    getLanguage,
    setLanguage,
  };
})();

export default i18nService;
