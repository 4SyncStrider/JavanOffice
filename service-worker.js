const CACHE_NAME = "javanoffice-pwa-v4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./pwa-register.js",
  "./service-worker.js",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./icons/favicon.jpg",
  "./menu/menu.css",
  "./menu/menu.js",
  "./Tools/to-do/index.html",
  "./Tools/to-do/style.css",
  "./Tools/to-do/script.js",
  "./Tools/简体繁体2/index.html",
  "./Tools/简体繁体2/style.css",
  "./Tools/简体繁体2/script.js",
  "./node_modules/opencc-js/dist/esm/full.js",
  "./Tools/Math_formula_properties/index.html",
  "./Tools/Math_formula_properties/style.css",
  "./Tools/Math_formula_properties/script.js",
  "./GAmes/Flappy-bird/index.html",
  "./GAmes/Flappy-bird/style.css",
  "./GAmes/Flappy-bird/script.js",
  "./GAmes/Google_dino/index.html",
  "./GAmes/Google_dino/phaser.min.js",
  "./GAmes/Google_dino/public/style.css",
  "./GAmes/Google_dino/src/scences/Game.js",
  "./GAmes/Google_dino/src/main.js",
  "./GAmes/Chess/index.html",
  "./GAmes/Chess/style.css",
  "./GAmes/Chess/script.js",
  "./GAmes/Chess/xiangqi.js",
  "./GAmes/Chess/images/Background-image.jpg",
  "./GAmes/Google_dino/public/assests/cactuses_1.png",
  "./GAmes/Google_dino/public/assests/cactuses_2.png",
  "./GAmes/Google_dino/public/assests/cactuses_3.png",
  "./GAmes/Google_dino/public/assests/cactuses_4.png",
  "./GAmes/Google_dino/public/assests/cactuses_5.png",
  "./GAmes/Google_dino/public/assests/cactuses_6.png",
  "./GAmes/Google_dino/public/assests/cactuses_white_1.png",
  "./GAmes/Google_dino/public/assests/cactuses_white_2.png",
  "./GAmes/Google_dino/public/assests/cactuses_white_3.png",
  "./GAmes/Google_dino/public/assests/cactuses_white_4.png",
  "./GAmes/Google_dino/public/assests/cactuses_white_5.png",
  "./GAmes/Google_dino/public/assests/cactuses_white_6.png",
  "./GAmes/Google_dino/public/assests/cloud.png",
  "./GAmes/Google_dino/public/assests/dino-down.png",
  "./GAmes/Google_dino/public/assests/dino-down-white.png",
  "./GAmes/Google_dino/public/assests/dino-hurt.png",
  "./GAmes/Google_dino/public/assests/dino-hurt-white.png",
  "./GAmes/Google_dino/public/assests/dino-idle.png",
  "./GAmes/Google_dino/public/assests/dino-run.png",
  "./GAmes/Google_dino/public/assests/dino-white.png",
  "./GAmes/Google_dino/public/assests/enemy-bird.png",
  "./GAmes/Google_dino/public/assests/enemy-bird-white.png",
  "./GAmes/Google_dino/public/assests/game-over.png",
  "./GAmes/Google_dino/public/assests/game-over-white.png",
  "./GAmes/Google_dino/public/assests/ground.png",
  "./GAmes/Google_dino/public/assests/hit.m4a",
  "./GAmes/Google_dino/public/assests/jump.m4a",
  "./GAmes/Google_dino/public/assests/numbers.png",
  "./GAmes/Google_dino/public/assests/numbers-white.png",
  "./GAmes/Google_dino/public/assests/reach.m4a",
  "./GAmes/Google_dino/public/assests/restart.png",
  "./GAmes/Google_dino/public/assests/restart-white.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(
          APP_SHELL.map(
            (path) => new Request(new URL(path, self.registration.scope), { cache: "reload" })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) => cacheName.startsWith("javanoffice-pwa-") && cacheName !== CACHE_NAME
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;
          return (await caches.match("./index.html")) || Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkResponse = fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
          }
          return response;
        })
        .catch(() => cachedResponse || Response.error());
      return cachedResponse || networkResponse;
    })
  );
});
