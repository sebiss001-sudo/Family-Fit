const CACHE = 'familyfit-v1';
const SHELL = ['./', 'index.html', 'tailwind.css', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png'];
const CDN = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'www.gstatic.com'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

// App files and library scripts are cached for offline use (stale-while-revalidate).
// Firestore, sign-in and food-database traffic is never cached here.
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.origin !== location.origin && !CDN.includes(url.hostname)) return;
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
    e.waitUntil(net.catch(() => {}));
    return hit || net;
  }));
});
