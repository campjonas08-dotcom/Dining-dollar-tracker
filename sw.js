/* Offline app-shell cache for the Stipend home-screen app.

   Network-first, falling back to cache only when offline: every request
   tries the network first so an open app always picks up the latest
   deploy, and the cache exists purely as an offline fallback -- not as
   the primary source. (The previous cache-first strategy served stale
   content instantly and only refreshed the cache quietly in the
   background, which meant a normal reload -- sometimes several -- often
   still showed old content until a hard refresh forced it.)

   Bump CACHE_NAME whenever the app shell file list changes, so old
   cached entries get swept on the next activate. */
const CACHE_NAME = 'stipend-v2';
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
    fetch(event.request).then((response) => {
      if(response && response.status === 200 && response.type === 'basic'){
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
