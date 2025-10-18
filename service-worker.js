// Define a unique name for the cache
const CACHE_NAME = 'ecosistema-adsi-cache-v2';

// List all the essential files that need to be cached for offline access
const urlsToCache = [
  '/',
  '/index.html',
  '/ecosistema_adsi_manifiesto.html',
  '/site.webmanifest',
  '/browserconfig.xml',
  '/favicon.ico',
  '/favicon-150.jpg',
  '/favicon-192.jpg',
  '/favicon-512.jpg',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Poppins:wght@600;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Poppins:wght@300;600;800&display=swap'
];

// Installation event: triggered when the service worker is first installed
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened, caching essential assets.');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: triggered for every request the page makes.
// It uses a cache-then-network strategy.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response from cache
        if (response) {
          return response;
        }

        // Not in cache - fetch from network and cache the response
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activation event: triggered when the service worker is activated.
// It cleans up old caches.
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
});
