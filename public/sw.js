// PWA Service Worker for Digital Commitment Vault
// Caches critical assets, CDNs, provides offline fallback, intercepts externals

const CACHE_NAME = 'vault-pwa-v1';
const OFFLINE_URL = '/offline.html'; // Will create fallback

// Critical URLs to cache (self + CDNs + static)
const CACHE_URLS = [
  '/',
  '/graph',
  '/index.html',
  '/Productivity/index.html',
  '/manifest.json',
  '/chart.js',
  // React/Tailwind/Babel CDNs (vault page)
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  // Chart.js CDN (graph page)
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js',
  // Fonts/Icons
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://img.icons8.com/?size=80&id=WzwD40yUyIpm&format=png'
];

// Install: Cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept fetches: Serve cache, fallback offline
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. API requests: Network-first (vault data needs fresh)
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({error: 'Offline - cached data may be stale'}), {
          headers: {'Content-Type': 'application/json'}
        });
      })
    );
    return;
  }

  // 2. External links/images: Cache-first, no new tabs (serve cached or skip)
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request).catch(() => {
        // Opaque response for blocked externals (no popup)
        return new Response('', {status: 200, statusText: 'cached'});
      }))
    );
    return;
  }

  // 3. App pages/assets: Cache-first with net fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => cachedResponse || fetch(event.request))
      .catch(() => caches.match(OFFLINE_URL) || caches.match('/'))
  );
});

// Background sync for API updates when online (optional)
self.addEventListener('sync', event => {
  if (event.tag === 'vault-sync') {
    // Sync vault changes
  }
});

// Push notifications (future)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

