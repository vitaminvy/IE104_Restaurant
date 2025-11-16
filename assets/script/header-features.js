// assets/script/header-features.js
import i18nService from './i18n-service.js';

// --- TRANSLATION LOGIC (from lang-toggle.js) ---
function getByPath(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function applyStaticTranslations() {
  const lang = i18nService.getLanguage();
  const translations = i18nService.getTranslations();

  if (Object.keys(translations).length === 0) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = getByPath(translations, key);
    if (val !== undefined) el.innerHTML = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = getByPath(translations, key);
    if (val !== undefined) el.setAttribute('placeholder', val);
  });

  document.documentElement.setAttribute('lang', lang);
}

// --- HEADER FEATURES INITIALIZATION ---
function initHeaderFeatures() {
  const headerRight = document.querySelector('.header__right');
  if (!headerRight) {
    console.error('Header right container not found.');
    return;
  }

  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'header__actions';
  
  // --- THEME TOGGLE ---
  function createThemeToggle() {
    const button = document.createElement('button');
    button.className = 'theme-toggle-btn';
    button.setAttribute('aria-label', 'Toggle theme');
    button.innerHTML = `
      <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
      <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
    `;

    button.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
    
    return button;
  }

  // --- LANGUAGE TOGGLE ---
  function createLanguageToggle() {
    const button = document.createElement('button');
    button.className = 'language-toggle';
    button.setAttribute('aria-label', 'Switch language');
    
    const flagImg = document.createElement('img');
    flagImg.id = 'language-flag';
    flagImg.style.width = '28px';
    flagImg.style.height = '28px';
    flagImg.style.objectFit = 'cover';
    flagImg.style.borderRadius = '50%';
    button.appendChild(flagImg);

    button.addEventListener('click', () => {
      const newLang = i18nService.getLanguage() === 'en' ? 'vi' : 'en';
      i18nService.setLanguage(newLang);
    });

    const updateFlag = (lang) => {
      const flagSrc = lang === 'en' ? '/assets/icons/united-kingdom.png' : '/assets/icons/vietnam.png';
      const flagAlt = lang === 'en' ? 'English' : 'Vietnamese';
      flagImg.src = flagSrc;
      flagImg.alt = flagAlt;
    };

    updateFlag(i18nService.getLanguage());
    document.addEventListener('language-changed', () => updateFlag(i18nService.getLanguage()));

    return button;
  }

  actionsContainer.appendChild(createThemeToggle());
  actionsContainer.appendChild(createLanguageToggle());
  headerRight.prepend(actionsContainer);
}

// --- MAIN INITIALIZATION LOGIC ---
async function initialize() {
  // 1. Wait for header/footer to be loaded
  document.addEventListener('includeLoaded', initHeaderFeatures);
  
  // 2. Initialize i18n service and apply translations
  await i18nService.init();
  applyStaticTranslations();

  // 3. Listen for language changes to re-apply translations
  document.addEventListener('language-changed', applyStaticTranslations);
}

// Run initialization
if (document.readyState !== 'loading') {
  initialize();
} else {
  document.addEventListener('DOMContentLoaded', initialize);
}