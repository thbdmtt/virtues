const CACHE_VERSION = "franklin-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const API_CACHE = `${CACHE_VERSION}-api`;
const PRECACHE = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
];

function isHttpRequest(requestUrl) {
  return requestUrl.protocol === "http:" || requestUrl.protocol === "https:";
}

function isStaticAsset(url, request) {
  if (request.destination === "image" || request.destination === "font") {
    return true;
  }

  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname === "/manifest.json")
  ) || (
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com"
  );
}

function isApiRequest(url, request) {
  return (
    request.method === "GET" &&
    url.origin === self.location.origin &&
    url.pathname.startsWith("/api/")
  );
}

function isTrackedPage(url, request) {
  if (request.method !== "GET") {
    return false;
  }

  if (request.mode === "navigate") {
    return url.origin === self.location.origin &&
      (url.pathname === "/" || url.pathname === "/history");
  }

  const acceptHeader = request.headers.get("accept") || "";

  return acceptHeader.includes("text/html") &&
    url.origin === self.location.origin &&
    (url.pathname === "/" || url.pathname === "/history");
}

async function remember(cacheName, request, response) {
  if (!response || (!response.ok && response.type !== "opaque")) {
    return response;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());

  return response;
}

async function tryPrecache(assetPath) {
  const cache = await caches.open(STATIC_CACHE);

  try {
    const request = new Request(assetPath, {
      cache: "reload",
      credentials: "same-origin",
    });
    const response = await fetch(request);

    if (response.ok || response.type === "opaque") {
      await cache.put(assetPath, response.clone());
    }
  } catch (error) {
    console.error("Precache failed for asset", assetPath, error);
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);

  return remember(STATIC_CACHE, request, networkResponse);
}

async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);

  try {
    const networkResponse = await fetch(request);
    const contentType = networkResponse.headers.get("content-type") || "";

    if (networkResponse.ok && contentType.includes("application/json")) {
      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw new Error("No cached API response available.");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(PAGE_CACHE);
  const cachedResponse = await cache.match(request);
  const fallbackKey = new URL(request.url).pathname;
  const fallbackResponse = await caches.match(fallbackKey);
  const networkPromise = fetch(request)
    .then((response) => remember(PAGE_CACHE, request, response))
    .catch(() => null);

  if (cachedResponse) {
    return cachedResponse;
  }

  if (fallbackResponse) {
    return fallbackResponse;
  }

  const networkResponse = await networkPromise;

  if (networkResponse) {
    return networkResponse;
  }

  throw new Error("No cached page response available.");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all(PRECACHE.map((assetPath) => tryPrecache(assetPath))).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("franklin-") && !cacheName.startsWith(CACHE_VERSION))
          .map((cacheName) => caches.delete(cacheName)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (!isHttpRequest(url) || request.method !== "GET") {
    return;
  }

  if (isApiRequest(url, request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isTrackedPage(url, request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (isStaticAsset(url, request)) {
    event.respondWith(cacheFirst(request));
  }
});
