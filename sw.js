const CACHE_NAME = "countdown-v1";

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k !== CACHE_NAME)
                        .map((k) => caches.delete(k)),
                ),
            ),
    );
    self.clients.claim();
});

// Fetch: network-first, fall back to cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clone = response.clone();
                caches
                    .open(CACHE_NAME)
                    .then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request)),
    );
});
