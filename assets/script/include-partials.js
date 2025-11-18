// scripts/include-partials.js
(async () => {
  const anchors = document.querySelectorAll("[data-include]");
  let loaded = 0;
  const total = anchors.length;

  for (const a of anchors) {
    const url = a.getAttribute("data-include");
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const html = await res.text();
      a.outerHTML = html;
    } catch (err) {
      console.error("Include failed:", url, err);
    } finally {
      loaded++;
      // create new signal for events
      if (loaded === total) {
        document.dispatchEvent(new Event("includes-loaded"));
      }
    }
  }

  document.dispatchEvent(new Event("includeLoaded"));
  // Dispatch a custom event after all partials are loaded
  document.dispatchEvent(new CustomEvent("partials:loaded"));
})();
