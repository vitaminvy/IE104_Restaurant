import i18nService from "./i18n-service.js";

(async () => {
  await i18nService.init();
  document.dispatchEvent(new CustomEvent("language-changed"));
})();
