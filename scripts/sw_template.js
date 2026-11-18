/* KeepTrip 오프라인 서비스워커 (scripts/build_sw.py 가 생성) */
const VERSION = '__VERSION__';
const APP = `keeptrip-app-${VERSION}`;
const RUNTIME = 'keeptrip-runtime';
const DATA = 'keeptrip-data';
const BASE = new URL('./', self.location).pathname;
const PRECACHE = __PRECACHE__;
const EXTERNAL = __EXTERNAL__;

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const app = await caches.open(APP);
    await app.addAll([BASE, ...PRECACHE.map((f) => BASE + f)]);
    const rt = await caches.open(RUNTIME);
    await Promise.all(EXTERNAL.map(async (u) => {
      try { const r = await fetch(u, { mode: u.includes('fonts.googleapis') || u.includes('jsdelivr') ? 'cors' : 'no-cors' }); await rt.put(u, r); } catch (_) { /* 외부 차단 시 무시 */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('keeptrip-app-') && k !== APP) await caches.delete(k);
    await self.clients.claim();
  })());
});

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

async function networkFirst(req, cacheName, ms, fallbackKey) {
  const cache = await caches.open(cacheName);
  try {
    const res = await withTimeout(fetch(req), ms);
    if (res.ok) cache.put(fallbackKey || req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(fallbackKey || req, { ignoreVary: true, ignoreSearch: !!fallbackKey });
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req, cacheName) {
  const hit = await caches.match(req, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') (await caches.open(cacheName)).put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(req, { ignoreVary: true });
  const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate' && url.origin === self.location.origin) {
    e.respondWith(networkFirst(req, APP, 3000, BASE).catch(() => caches.match(BASE)));
    return;
  }
  if (url.hostname.endsWith('.supabase.co')) {
    e.respondWith(networkFirst(req, DATA, 5000));
    return;
  }
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith(BASE + 'api/')) return;
    e.respondWith(cacheFirst(req, RUNTIME));
    return;
  }
  e.respondWith(staleWhileRevalidate(req));
});
