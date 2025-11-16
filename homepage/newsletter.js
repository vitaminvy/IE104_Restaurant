function initNewsletterForm() {
  const form = document.querySelector('#newsletter .newsletter__form');
  const successMessage = document.getElementById('newsletter-success');

  if (!form || !successMessage) return;

  const emailInput = form.querySelector('input[type="email"]');
  const submitBtn = form.querySelector('.newsletter__submit');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!emailInput || !emailInput.value.trim()) {
      emailInput?.focus();
      emailInput?.reportValidity?.();
      return;
    }

    submitBtn.disabled = true;
    successMessage.classList.remove('is-visible');
    successMessage.textContent = '';

    setTimeout(() => {
      const nameHint = emailInput.value.split('@')[0] || 'friend';
      successMessage.textContent = `Thanks, ${nameHint}! A fresh story is on its way to your inbox.`;
      successMessage.classList.add('is-visible');
      form.reset();
      submitBtn.disabled = false;
    }, 600);
  });

  emailInput?.addEventListener('input', () => {
    successMessage.classList.remove('is-visible');
    successMessage.textContent = '';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewsletterForm);
} else {
  initNewsletterForm();
}
