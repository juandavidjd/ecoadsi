// Define a unique name for the cache
const CACHE_NAME = 'ecosistema-adsi-cache-v5';
const OFFLINE_URL = 'offline.html';

// List all the essential files that need to be cached for offline access
const urlsToCache = [
  '/',
  'index.html',
  'ecosistema_adsi_manifiesto.html',
  'site.webmanifest',
  'browserconfig.xml',
  'favicon.ico',
  'favicon-150.jpg',
  'favicon-192.jpg',
  'favicon-512.jpg',
  'offline.html',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Poppins:wght@600;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Poppins:wght@300;600;800&display=swap'
];

// Installation event: triggered when the service worker is first installed
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened, caching essential assets for offline use.');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activation event: triggered when the service worker is activated.
// This is a good time to clean up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: triggered for every request the page makes.
self.addEventListener('fetch', event => {
  // We only want to handle navigation requests for HTML pages.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Always try the network first for navigation.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // The catch is triggered if the network fails.
          console.log('Fetch failed; returning offline page instead.', error);

          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  } else {
    // For non-navigation requests (like images, CSS, JS), use a cache-first strategy.
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return the cached response if found, otherwise fetch from network.
          return response || fetch(event.request);
        })
    );
  }
});

