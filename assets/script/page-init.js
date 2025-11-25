import i18nService from "./i18n-service.js";

// Show loader during initialization
if (window.GlobalLoader) {
  window.GlobalLoader.show('Loading content...');
}

(async () => {
  await i18nService.init();
  document.dispatchEvent(new CustomEvent("language-changed"));

  // Hide loader after content is loaded
  if (window.GlobalLoader) {
    // A small delay to perceive the loading, can be adjusted
    setTimeout(() => window.GlobalLoader.hide(300), 200);
  }
})();
