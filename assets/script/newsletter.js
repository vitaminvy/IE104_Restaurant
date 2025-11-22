(() => {
  // Lightweight newsletter subscription feedback helper
  const processedForms = new WeakSet();
  const successMessages = {
    en: "Thanks for subscribing! Please check your inbox.",
    vi: "Đăng ký thành công! Bạn nhớ kiểm tra email nhé.",
  };

  // Resolve the message based on the current <html lang>
  const getCurrentLang = () =>
    document.documentElement.getAttribute("lang")?.toLowerCase() || "en";

  const getMessage = () =>
    successMessages[getCurrentLang()] ?? successMessages.en;

  // Attach submit handlers to every newsletter form (one time only)
  function initNewsletterForms() {
    const forms = document.querySelectorAll("[data-newsletter-form]");
    forms.forEach((form) => {
      if (processedForms.has(form)) return;
      processedForms.add(form);

      let statusEl =
        form.parentElement.querySelector(".newsletter__status") ||
        document.createElement("p");

      statusEl.classList.add("newsletter__status");
      statusEl.hidden = true;

      if (!statusEl.parentElement) {
        form.parentElement.appendChild(statusEl);
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = (new FormData(form).get("email") || "")
          .toString()
          .trim();
        if (!email) return;

        form.reset();
        revealStatus(statusEl);
      });
    });
  }

  // Show temporary confirmation text below the form
  function revealStatus(statusEl) {
    statusEl.textContent = getMessage();
    statusEl.hidden = false;

    clearTimeout(statusEl._hideTimeout);
    statusEl._hideTimeout = setTimeout(() => {
      statusEl.hidden = true;
      statusEl.textContent = "";
    }, 4000);
  }

  // Keep visible success messages in sync with language changes
  document.addEventListener("languageChange", () => {
    document.querySelectorAll(".newsletter__status:not([hidden])").forEach(
      (statusEl) => {
        statusEl.textContent = getMessage();
      }
    );
  });

  document.addEventListener("DOMContentLoaded", initNewsletterForms);
  document.addEventListener("partials:loaded", initNewsletterForms);
})();
