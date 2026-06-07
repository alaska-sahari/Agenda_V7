const CACHE_NAME = "kml-cache-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png"
];

self.addEventListener("install", (event) => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
  
      return Promise.all(
        FILES_TO_CACHE.map(file =>
          cache.add(file).catch(err => {
            console.log("Cache failed:", file);
          })
        )
      );
  
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  event.respondWith(

    caches.match(event.request)
    .then(cached => {

      return cached ||

        fetch(event.request)
        .then(response => {

          const clone = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone));

          return response;
        })

        .catch(() => caches.match("./index.html"));
    })
  );
});