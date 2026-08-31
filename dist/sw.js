const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `docw-v${CACHE_VERSION}`;
const ASSET_CACHE_NAME = `docw-assets-v${CACHE_VERSION}`;
const DATA_CACHE_NAME = `docw-data-v${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './data/cases.json',
  './data/roleplayCases.json',
  './data/cr-registry.json',
  './data/cr-208-v3.json',
  './data/cr-301-v2.json',
  './data/cr-415-v2.json',
  './data/meta-zone/index.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.includes(CACHE_VERSION))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // 1. Data files (JSON) — Cache First, then network
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // 2. Static assets (JS/CSS/fonts/images) — Cache First
  if (url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    event.respondWith(
      caches.open(ASSET_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // 3. Navigation — Network First, fallback to index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 4. Everything else — Stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      });
    })
  );
});
