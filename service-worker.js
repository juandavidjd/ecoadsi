    // Define a unique name for the cache
    const CACHE_NAME = 'ecosistema-adsi-cache-v1';

    // List all the essential files that need to be cached
    const urlsToCache = [
      '/',
      'index.html',
      'https://cdn.tailwindcss.com',
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Poppins:wght@300;600;800&display=swap'
      // Add paths to your favicons if you have them, e.g., '/favicon.ico'
    ];

    // Installation event: triggered when the service worker is first installed
    self.addEventListener('install', event => {
      // Perform install steps
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
          })
      );
    });

    // Fetch event: triggered for every request the page makes
    self.addEventListener('fetch', event => {
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            // Cache hit - return response from cache
            if (response) {
              return response;
            }
            // Not in cache - fetch from network
            return fetch(event.request);
          }
        )
      );
    });
    
