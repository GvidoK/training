// Service worker: app shell cache-first, lai Burtu Taka strādā offline uz
// planšetes pēc pirmās ielādes. Versiju numuru palielini, mainot failus,
// lai vecais cache tiktu iztīrīts.
const CACHE_VERSION = 'burtu-taka-v2';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './src/app.js',
  './src/data/path-utils.js',
  './src/data/letters-print.js',
  './src/data/digits.js',
  './src/data/registry.js',
  './src/engine/drawing-engine.js',
  './src/state/progress-store.js',
  './src/modes/mode-registry.js',
  './src/modes/trace-mode.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => cached);
    })
  );
});
