const CACHE_VERSION = "kml-v7.3";
const CACHE_NAME = `kml-cache-${CACHE_VERSION}`;

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png"
];

/* =========================
   INSTALL
========================= */
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

/* =========================
   ACTIVATE (safe update)
========================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          // نحذف فقط الكاش القديم الخاص بالتطبيق
          if (key.startsWith("kml-cache-") && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/* =========================
   FETCH (safe offline)
========================= */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(res => {
        const clone = res.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});

/* =========================
   UPDATE MESSAGE
========================= */
self.addEventListener("message", (event) => {
  if (event.data?.type === "skipWaiting") {
    self.skipWaiting();
  }
});