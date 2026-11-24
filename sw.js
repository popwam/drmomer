// Increment the cache version on each deployed release.
const CACHE = 'drmomar-pwa-v3.0.0';
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/app.js",
  "./js/config.js",
  "./js/pwa.js",
  "./img/bg-mobile.webp",
  "./img/bg-mobile2.webp",
  "./img/bg-web.webp",
  "./img/bg-web2.webp",
  "./img/drmomer.jpg",
  "./img/ico.webp",
  "./img/img-01.webp",
  "./img/img-02.webp",
  "./img/img-03.webp",
  "./img/img-04.webp",
  "./img/img-05.webp",
  "./img/img-06.webp",
  "./img/img-07.webp",
  "./img/img-08.webp",
  "./img/img-09.webp",
  "./img/img-10.webp",
  "./img/img-11.webp",
  "./img/img-12.webp",
  "./img/img-13.webp",
  "./img/te-01.webp",
  "./img/te-02.webp",
  "./img/te-03.webp",
  "./img/te-04.webp",
  "./img/te-05.webp",
  "./img/te-06.webp",
  "./img/te-07.webp",
  "./img/te-08.webp",
  "./img/te-09.webp",
  "./img/te-10.webp",
  "./img/te-11.webp",
  "./img/te-12.webp",
  "./img/te-13.webp",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png"
];
const urls = new Set(ASSETS.map(path => new URL(path, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(path => new Request(path, {cache:'reload'})))));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('drmomar-pwa-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (request.mode === 'navigate' && (url.pathname === scope.pathname || url.pathname === new URL('index.html',scope).pathname)) {
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match('./index.html')) || fetch(request)));
  } else if (urls.has(request.url)) {
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(request)) || fetch(request)));
  }
  // No caching of WhatsApp, booking requests, external websites or user information.
});
