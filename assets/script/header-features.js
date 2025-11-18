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

  const errorAttrMap = [
    { key: 'required', target: 'data-error-required' },
    { key: 'minLength', target: 'data-error-minLength' },
    { key: 'maxLength', target: 'data-error-maxLength' },
    { key: 'email', target: 'data-error-email' },
    { key: 'phone', target: 'data-error-phone' },
    { key: 'date', target: 'data-error-date' },
    { key: 'time', target: 'data-error-time' },
    { key: 'pattern', target: 'data-error-pattern' },
    { key: 'number', target: 'data-error-number' }
  ];

  errorAttrMap.forEach(({ key, target }) => {
    document.querySelectorAll(`[data-i18n-error-${key}]`).forEach(el => {
      const attrName = `data-i18n-error-${key}`;
      const translationKey = el.getAttribute(attrName);
      const val = getByPath(translations, translationKey);
      if (val !== undefined) {
        el.setAttribute(target, val);
      }
    });
  });

  document.documentElement.setAttribute('lang', lang);
}

// --- LANGUAGE FLAG UPDATE HELPER ---
function updateAllLanguageFlags(lang) {
  const headerFlag = document.querySelector('#language-flag');
  if (headerFlag) {
    headerFlag.src = lang === 'en' ? '../assets/icons/united-kingdom.png' : '../assets/icons/vietnam.png';
    headerFlag.alt = lang === 'en' ? 'English' : 'Vietnamese';
  }

  document.querySelectorAll('.footer__language-link').forEach(link => {
    const linkLang = link.querySelector('.footer__language-flag').alt === 'English' ? 'en' : 'vi';
    if (linkLang === lang) {
      link.classList.add('footer__language-link--active');
    } else {
      link.classList.remove('footer__language-link--active');
    }
  });
}

// --- HEADER FEATURES INITIALIZATION ---
function initHeaderFeatures() {
  const headerRight = document.querySelector('.header__right');
  if (!headerRight) {
    // console.error('Header right container not found.');
    return;
  }

  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'header__actions';
  
  // --- THEME TOGGLE ---
  function createThemeToggle() {
    const button = document.createElement('button');
    button.className = 'header-action-btn theme-toggle-btn';
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
      updateFooterLogo(); // Call to update footer logo on theme change
      updateHeaderLogo(); // Call to update header logo on theme change
    });
    
    return button;
  }

  // --- LANGUAGE TOGGLE (HEADER) ---
  function createHeaderLanguageToggle() {
    const button = document.createElement('button');
    button.className = 'header-action-btn language-toggle';
    button.setAttribute('aria-label', 'Switch language');
    
    const flagImg = document.createElement('img');
    flagImg.id = 'language-flag';
    flagImg.className = 'language-toggle__flag';
    button.appendChild(flagImg);

    button.addEventListener('click', () => {
      const newLang = i18nService.getLanguage() === 'en' ? 'vi' : 'en';
      i18nService.setLanguage(newLang);
    });

    updateAllLanguageFlags(i18nService.getLanguage());
    document.addEventListener('language-changed', () => updateAllLanguageFlags(i18nService.getLanguage()));

    return button;
  }

  actionsContainer.appendChild(createThemeToggle());
  actionsContainer.appendChild(createHeaderLanguageToggle()); // Use the new header specific function
  headerRight.prepend(actionsContainer);
}

function runAfterPartials() {
  initHeaderFeatures();
  setupFooterLanguageToggles(); // Setup footer language toggles
  updateFooterLogo(); // Initial call to update footer logo
  updateHeaderLogo(); // Initial call to update header logo
  applyStaticTranslations();
}

function arePartialsReady() {
  return document.getElementById('header') && document.getElementById('footer');
}

function waitForPartials(callback) {
  if (arePartialsReady()) {
    callback();
    return;
  }

  const handler = () => {
    if (arePartialsReady()) {
      document.removeEventListener('partials:loaded', handler);
      callback();
    }
  };

  document.addEventListener('partials:loaded', handler);
}

// --- FOOTER LANGUAGE TOGGLES ---
function setupFooterLanguageToggles() {
  document.querySelectorAll('.footer__language-link').forEach(link => {
    // Remove existing listeners to prevent duplicates if called multiple times
    const oldLink = link.cloneNode(true);
    link.parentNode.replaceChild(oldLink, link);
    link = oldLink;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = link.querySelector('.footer__language-flag').alt === 'English' ? 'en' : 'vi';
      if (i18nService.getLanguage() !== targetLang) {
        i18nService.setLanguage(targetLang);
      }
    });
  });
  updateAllLanguageFlags(i18nService.getLanguage()); // Initial update for footer flags
}


// --- FOOTER LOGO LOGIC ---
function updateFooterLogo() {
  const footerLogo = document.querySelector('.footer__logo img');
  if (!footerLogo) return;

  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'light') {
    footerLogo.src = '../assets/icons/logo_bg_dark.png';
    footerLogo.alt = 'WowWraps logo (Light Mode)';
  } else {
    footerLogo.src = '../assets/images/home-page/footer-section/logo-wow-wraps.svg';
    footerLogo.alt = 'WowWraps logo';
  }
}

// --- HEADER LOGO LOGIC ---
function updateHeaderLogo() {
    const headerLogo = document.querySelector('.header__logo img');
    if (!headerLogo) return;

    const isComingSoonPage = document.querySelector('main .comingsoon'); // Check for the comingsoon section within main
    const currentTheme = document.documentElement.getAttribute('data-theme');

    if (isComingSoonPage) {
        // On coming soon page, always use the dark mode logo
        headerLogo.src = '../assets/icons/icon-header/nav-vect.svg';
        headerLogo.alt = 'Restaurant Logo'; // Ensure alt text is consistent
    } else if (currentTheme === 'light') {
        headerLogo.src = '../assets/icons/icon-header/logo_bg_dark_no_text.png';
        headerLogo.alt = 'Restaurant Logo (Light Mode)';
    } else {
        headerLogo.src = '../assets/icons/icon-header/nav-vect.svg';
        headerLogo.alt = 'Restaurant Logo';
    }
}

// --- MAIN INITIALIZATION LOGIC ---
async function initialize() {
  waitForPartials(runAfterPartials);

  // Initialize i18n service and apply translations
  await i18nService.init();
  applyStaticTranslations();

  // Listen for language changes to re-apply translations
  document.addEventListener('language-changed', applyStaticTranslations);
}

// Run initialization
if (document.readyState !== 'loading') {
  initialize();
} else {
  document.addEventListener('DOMContentLoaded', initialize);
}
