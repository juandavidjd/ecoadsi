// service-worker.js

// Define un nombre y versión únicos para el caché.
// Cambia el número de la versión (ej. v6, v7) cada vez que actualices los archivos
// para forzar al navegador a descargar la nueva versión.
const CACHE_NAME = 'ecosistema-adsi-cache-v5';
const OFFLINE_URL = 'offline.html';

// Lista completa de los archivos que se guardarán en caché para que la app funcione offline.
const urlsToCache = [
  '/',
  'index.html',
  'ecosistema_adsi_manifiesto.html',
  'offline.html',
  'favicon.ico',
  'favicon-150.jpg',
  'favicon-192.jpg',
  'favicon-512.jpg',
  'site.webmanifest',
  'browserconfig.xml',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Poppins:wght@600;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Poppins:wght@300;600;800&display=swap'
];

// Evento 'install': Se dispara cuando el navegador instala el service worker por primera vez.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto, guardando archivos principales de la aplicación.');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Falló el precaching de archivos, error:', error);
      })
  );
  // Forzar al nuevo service worker a activarse inmediatamente.
  self.skipWaiting();
});

// Evento 'activate': Se dispara después de que el service worker se instala.
// Es el momento ideal para limpiar cachés antiguos.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control de todas las pestañas abiertas inmediatamente.
  return self.clients.claim();
});

// Evento 'fetch': Intercepta cada petición que hace la página.
self.addEventListener('fetch', event => {
  // Estrategia para peticiones de navegación (cuando se pide una página HTML).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Si la petición a la red falla (está offline),
        // abre el caché y devuelve la página offline.html.
        return caches.open(CACHE_NAME).then(cache => {
          return cache.match(OFFLINE_URL);
        });
      })
    );
  } else {
    // Estrategia "Cache First" para todos los demás recursos (CSS, JS, imágenes).
    event.respondWith(
      caches.match(event.request).then(response => {
        // Si el recurso ya está en caché, lo devuelve.
        // Si no, lo busca en la red.
        return response || fetch(event.request);
      })
    );
  }
});

