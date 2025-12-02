// scripts/include-partials.js
async function loadPartials() {
  const anchors = document.querySelectorAll("[data-include]");
  let loaded = 0;
  const total = anchors.length;

  if (total === 0) {
    // If no partials to load, dispatch events immediately so other scripts don't hang
    document.dispatchEvent(new Event("includes-loaded"));
    document.dispatchEvent(new Event("includeLoaded"));
    document.dispatchEvent(new CustomEvent("partials:loaded"));
    return;
  }

  for (const a of anchors) {
    const url = a.getAttribute("data-include");
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const html = await res.text();
      // Parse the HTML string into a document fragment to execute scripts if any (though innerHTML/outerHTML usually doesn't exec scripts)
      // For simple replacement:
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Replace the anchor with the content
      a.replaceWith(...tempDiv.childNodes);
    } catch (err) {
      console.error("Include failed:", url, err);
    } finally {
      loaded++;
      if (loaded === total) {
        document.dispatchEvent(new Event("includes-loaded"));
        document.dispatchEvent(new Event("includeLoaded"));
        document.dispatchEvent(new CustomEvent("partials:loaded"));
      }
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPartials);
} else {
  loadPartials();
}
