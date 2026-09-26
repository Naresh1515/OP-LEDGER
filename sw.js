// Minimal service worker: caches the app shell so it still opens offline.
// Safe no-op if something goes wrong — it never blocks normal loading.
const CACHE = 'strike-ledger-v1';
const ASSETS = [
  './',
  './manifest.json',
  './icon-192.png',
  './chart.umd.min.js',
  './xlsx.full.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});
