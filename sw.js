const CACHE = 'licentest-v1';
const ASSETS = [
  '/', '/style.css', '/app.js', '/preguntas.js', '/preguntas_combo.js',
  '/licentest.png', '/icon-192.png', '/icon-512.png',
  '/Ley109.pdf', '/robots.txt', '/sitemap.xml'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
});
