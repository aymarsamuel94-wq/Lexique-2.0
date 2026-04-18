const CACHE_VERSION = 'lexique-v5-2.0';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(r => { const c = r.clone(); caches.open(CACHE_VERSION).then(ch => ch.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(cs => {
    if (cs.length) { cs[0].focus(); return; }
    clients.openWindow('./index.html');
  }));
});
