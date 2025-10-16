const CACHE_NAME = "ecoadsi-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/favicon-adsi.png",
  "/site.webmanifest",
  "/browserconfig.xml",
  "/feed.xml"
];

// Instalar y almacenar en caché
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar y limpiar cachés antiguas
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Responder desde caché o red
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(
      (res) => res || fetch(e.request).catch(() => caches.match("/index.html"))
    )
  );
});
