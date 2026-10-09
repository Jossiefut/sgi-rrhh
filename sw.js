/* Service worker de SGI RRHH. Prioriza siempre la red para que cada versión publicada llegue de inmediato;
   el caché solo sirve para abrir la pantalla de acceso sin conexión. No guarda datos de Supabase ni de otros orígenes. */
const CACHE = 'sgi-rrhh-shell-v1';
const ESTATICOS = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ESTATICOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return; // Supabase y demás: siempre directo a la red
  e.respondWith(fetch(r).then((resp) => {
    if (resp && resp.ok && (r.mode === 'navigate' || ESTATICOS.includes(u.pathname))) { const copia = resp.clone(); caches.open(CACHE).then((c) => c.put(r.mode === 'navigate' ? '/' : r, copia)); }
    return resp;
  }).catch(() => caches.match(r.mode === 'navigate' ? '/' : r)));
});
