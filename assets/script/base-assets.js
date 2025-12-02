// assets/script/base-assets.js
// Injects the shared CSS/JS stack so every page can stay lean
(function () {
  const script = document.currentScript;
  const head = document.head || document.getElementsByTagName('head')[0];

  // Resolve the project root based on where this script is loaded from
  const rootHref = (() => {
    try {
      const url = new URL(script.src, document.baseURI);
      return url.href.replace(/assets\/script\/base-assets\.js(?:\?.*)?$/, '');
    } catch (err) {
      return './';
    }
  })();

  const loaded = new Set([
    ...Array.from(document.querySelectorAll('link[href]')).map((el) =>
      new URL(el.href, document.baseURI).href
    ),
    ...Array.from(document.querySelectorAll('script[src]')).map((el) =>
      new URL(el.src, document.baseURI).href
    )
  ]);

  const ensureEl = (tag, attrs) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined) el.setAttribute(key, value);
    });
    head.appendChild(el);
    return el;
  };

  const addPreconnect = (href, crossorigin) => {
    const resolved = new URL(href, rootHref).href;
    if (loaded.has(resolved)) return;
    loaded.add(resolved);
    ensureEl('link', {
      rel: 'preconnect',
      href: resolved,
      ...(crossorigin ? { crossorigin: crossorigin === true ? 'anonymous' : crossorigin } : {})
    });
  };

  const addStyle = (href, rel = 'stylesheet') => {
    const resolved = new URL(href, rootHref).href;
    if (loaded.has(resolved)) return;
    loaded.add(resolved);
    ensureEl('link', { rel, href: resolved });
  };

  const addScript = (src, { type, defer = true } = {}) => {
    const resolved = new URL(src, rootHref).href;
    if (loaded.has(resolved)) return;
    loaded.add(resolved);
    ensureEl('script', { src: resolved, ...(type ? { type } : {}), ...(defer ? { defer: '' } : {}) });
  };

  // Connection hints
  addPreconnect('https://fonts.googleapis.com');
  addPreconnect('https://fonts.gstatic.com', 'anonymous');

  // Shared styles
  [
    'style/reset.css',
    'style/style.css',
    'style/animations.css',
    'style/back-to-top.css',
    'style/form-validation.css',
    'style/notification-system.css',
    'partials/header.css',
    'partials/footer.css',
    'assets/features/theme-toggle.css',
    'assets/features/allergy-alert.css',
    'https://fonts.googleapis.com/css2?family=Libre+Bodoni:ital,wght@0,400..700;1,400..700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
  ].forEach((href) => addStyle(href));

  // Shared scripts
  [
    { src: 'assets/script/global-loader.js' },
    { src: 'assets/script/include-partials.js' },
    { src: 'assets/script/scroll-animations.js' },
    { src: 'assets/script/form-validator.js' },
    { src: 'assets/script/notification-system.js' },
    { src: 'assets/script/back-to-top.js' },
    { src: 'assets/script/header.js', type: 'module', defer: false },
    { src: 'assets/script/header-features.js', type: 'module', defer: false }
  ].forEach((entry) => addScript(entry.src, entry));
})();
