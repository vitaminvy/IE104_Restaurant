document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector(".contact-form__form");
  if (!contactForm) return;

  let statusMessage = null;
  let hideStatusTimeout;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    contactForm.reset();

    if (!statusMessage) {
      statusMessage = document.createElement("p");
      statusMessage.className = "form-status";
      statusMessage.setAttribute("role", "status");
      statusMessage.setAttribute("aria-live", "polite");
      contactForm.appendChild(statusMessage);
    }

    statusMessage.hidden = false;
    statusMessage.dataset.i18n = "contact_us.form.success_message";
    statusMessage.textContent = getTranslatedMessage();

    window.clearTimeout(hideStatusTimeout);
    hideStatusTimeout = window.setTimeout(() => {
      if (!statusMessage) return;
      statusMessage.hidden = true;
      statusMessage.textContent = "";
      statusMessage.remove();
      statusMessage = null;
    }, 4000);
  });

  document.addEventListener("languageChange", () => {
    if (statusMessage && !statusMessage.hidden) {
      statusMessage.textContent = getTranslatedMessage();
    }
  });

  function getTranslatedMessage() {
    const htmlLang = document.documentElement.getAttribute("lang") || "en";
    return htmlLang === "vi"
      ? "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm."
      : "Thanks for reaching out! We'll get back to you shortly.";
  }
});
