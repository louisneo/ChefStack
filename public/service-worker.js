const CACHE_NAME = 'chefstack-v26';

const STATIC_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon.png?v=26',
  '/favicon.ico?v=26'
];

// Install event - Pre-cache the app shell and skip waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL);
    })
  );
});

// Activate event - Claim clients and purge all old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ChefStack SW] Purging stale cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Different strategies for different resource types
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Skip third-party API endpoints (Gemini, Supabase, etc.) — network only
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. For JS bundles, fonts, and images: CACHE-FIRST (critical for offline)
  //    These are hashed/versioned files that don't change once deployed
  const isCacheableAsset =
    url.pathname.startsWith('/_expo/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico');

  if (isCacheableAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Not in cache yet — fetch from network and cache for next time
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        }).catch(() => {
          // Asset not available offline — return nothing (app will handle gracefully)
          return new Response('', { status: 408, statusText: 'Offline' });
        });
      })
    );
    return;
  }

  // 3. For HTML navigation: NETWORK-FIRST with offline fallback to cached index.html
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline — serve cached version or fall back to index.html for SPA routing
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // SPA fallback: serve index.html for any HTML navigation request
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
          return caches.match('/');
        });
      })
  );
});
