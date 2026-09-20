const CACHE_NAME = 'strike-ledger-v1';
const SHELL_FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isShell = SHELL_FILES.some((f) => url.pathname.endsWith(f.replace('./', '')));
  if (isShell) {
    event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
      return res;
    })));
    return;
  }
  event.respondWith(fetch(req).then((res) => {
    const clone = res.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
    return res;
  }).catch(() => caches.match(req)));
});
