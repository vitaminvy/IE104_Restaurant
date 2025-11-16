document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-newsletter-form]");
  if (!form) return;

  const statusEl =
    form.parentElement.querySelector(".newsletter__status") ||
    document.createElement("p");

  statusEl.classList.add("newsletter__status");
  statusEl.hidden = true;

  form.parentElement.appendChild(statusEl);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const emailValue = formData.get("email") || "";
    if (!emailValue.trim()) return;

    form.reset();
    showStatus("home.newsletter.success", getSuccessText());
  });

  document.addEventListener("languageChange", () => {
    if (!statusEl.hidden) {
      statusEl.textContent = translate("home.newsletter.success", getSuccessText());
    }
  });

  function showStatus(key, fallback) {
    statusEl.textContent = translate(key, fallback);
    statusEl.hidden = false;
    statusEl.dataset.i18n = key;
    clearTimeout(statusEl.timeoutId);
    statusEl.timeoutId = setTimeout(() => {
      statusEl.hidden = true;
      statusEl.textContent = "";
    }, 4000);
  }

  function translate(key, fallback) {
    const el = document.querySelector(`[data-i18n="${key}"]`);
    if (el) return el.textContent.trim();
    const htmlLang = document.documentElement.getAttribute("lang") || "en";
    return htmlLang === "vi"
      ? "Đăng ký thành công! Bạn hãy kiểm tra email nhé."
      : fallback;
  }

  function getSuccessText() {
    return "Thanks for subscribing! Please check your inbox.";
  }
});
