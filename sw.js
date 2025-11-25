const CACHE_NAME = 'wowwraps-fallback-v1';
const OFFLINE_FALLBACK = '/404.html';

function buildFallbackResponse() {
  return caches.match(OFFLINE_FALLBACK).then((fallback) => {
    if (!fallback) return Response.redirect(OFFLINE_FALLBACK, 302);
    return new Response(fallback.body, {
      status: 404,
      statusText: 'Not Found',
      headers: fallback.headers,
    });
  });
}

// Precache the 404 page for offline/fallback usage
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_FALLBACK]))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle full page navigations
  if (event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If the server says "not found", serve our custom 404 page instead
        if (response.status === 404) {
          return buildFallbackResponse();
        }
        return response;
      })
      // Network errors (offline, etc.) also fall back to the custom 404
      .catch(() => buildFallbackResponse())
  );
});
