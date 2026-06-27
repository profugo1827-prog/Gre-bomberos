const CACHE_NAME = 'gre-bomberos-v1';

const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Instalación — cachear archivos core
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS_CACHE))
  );
  self.skipWaiting();
});

// Activación — limpiar caches viejos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache primero, red como fallback
// Para Open-Meteo (viento): red primero, sin guardar en cache
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // API de viento: siempre intentar red, sin cache
  if (url.includes('open-meteo.com')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'Sin conexión' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Todo lo demás: cache primero
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
