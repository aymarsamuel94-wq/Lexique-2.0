const CACHE_VERSION = 'lexique-v8-optimized';
const ASSETS = [
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      console.log('[SW] Mise en cache des assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  // Cache First pour les polices Google (elles changent rarement)
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(response => {
          return caches.open(CACHE_VERSION).then(cache => {
            cache.put(e.request, response.clone());
            return response;
          });
        });
      })
    );
  } else {
    // Network First pour le reste (HTML, JS, etc.)
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const cloned = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(e.request, cloned));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length) {
        clientList[0].focus();
        return;
      }
      clients.openWindow('./index.html');
    })
  );
});