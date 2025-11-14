// Create a global object to expose the init function
window.i18n = (function () {
  const I18N_CONFIG = {
    storageKey: 'language',
    defaultLang: 'en',
    flagElementId: 'language-flag',
    toggleElementId: 'language-toggle',
    translationPath: '/assets/translations',
  };

  let translations = {};

  async function fetchTranslations(lang) {
    try {
      const response = await fetch(`${I18N_CONFIG.translationPath}/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${lang}.json`);
      }
      return await response.json();
    } catch (error) {
      console.error('Translation fetch error:', error);
      return {}; // Return empty object on error
    }
  }

  function translatePage() {
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
      const key = element.getAttribute('data-i18n-key');
      const translation = translations[key];
      if (translation) {
        element.textContent = translation;
      }
    });
  }

  function updateFlag(lang) {
    const flagElement = document.getElementById(I18N_CONFIG.flagElementId);
    if (flagElement) {
      const flag = lang === 'en' ? 'united-kingdom' : 'vietnam';
      flagElement.src = `/assets/icons/${flag}.png`;
      flagElement.alt = lang === 'en' ? 'English' : 'Vietnamese';
    }
  }

  async function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'vi') {
      lang = I18N_CONFIG.defaultLang;
    }
    
    translations = await fetchTranslations(lang);
    translatePage();
    updateFlag(lang);
    
    try {
      localStorage.setItem(I18N_CONFIG.storageKey, lang);
    } catch (error) {
      console.error('Failed to save language to localStorage:', error);
    }
  }

  function toggleLanguage() {
    const currentLang = localStorage.getItem(I18N_CONFIG.storageKey) || I18N_CONFIG.defaultLang;
    const newLang = currentLang === 'en' ? 'vi' : 'en';
    setLanguage(newLang);
  }

  function init() {
    const toggleButton = document.getElementById(I18N_CONFIG.toggleElementId);
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleLanguage);
    }

    const savedLang = localStorage.getItem(I18N_CONFIG.storageKey) || I18N_CONFIG.defaultLang;
    setLanguage(savedLang);
  }

  // Return the public interface
  return {
    init: init
  };

})();
