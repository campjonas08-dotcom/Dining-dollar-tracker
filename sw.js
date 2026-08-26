/* Offline app-shell cache for the Stipend home-screen app.
   Bump CACHE_NAME whenever the app shell files change so clients pick up
   the new version instead of serving a stale cache. */
const CACHE_NAME = 'stipend-v1';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './dining-icon.png',
  './sync.js',
  './firebase-config.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if(response && response.status === 200 && response.type === 'basic'){
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);

      return cached || network;
    })
  );
});
