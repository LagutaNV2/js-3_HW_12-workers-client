// src/service-worker.js
const CACHE_NAME = "my-best-cache";

const FETCH_PRIORITY_URLS = [
  "/", // Главная страница
  "/index.html", // HTML-файл
  "/src/css/style.css", // Основной CSS
  "/src/js/app.js", // Основной JS
];

const urlsDistToCache = [
  "/",
  "/index.html",
  "/main.css",
  "/main.js",
  "/images/fallback/user.jpg",
];

const urlsToCache = [
  "/", // Корневой путь
  "/index.html", // Главная страница
  "/src/css/style.css", // Основной CSS
  "/src/js/app.js", // Основной JS
  "/src/images/fallback/user.jpg", // Fallback-изображ
];

// Логирование событий Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker установлен, событие: ", event);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Кешируем ресурсы:", urlsDistToCache);
      return cache
        .addAll(urlsDistToCache)
        .then(() => {
          console.log("Ресурсы успешно закэшированы");
        })
        .catch((error) => {
          console.error("Ошибка при кешировании ресурсов:", error);
        });
    }),
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker активирован, событие:", event);
  // event.waitUntil(self.clients.claim());
  // Очистка старых кешей
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Удаляем старый кеш:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

/**
 * Стратегия: Кэш в приоритете, затем сеть
 */
async function cachePriorityThenFetch(event) {
  const cacheResponse = await caches.match(event.request);

  if (cacheResponse) {
    console.log(`Запрос обслужен из кэша: ${event.request.url}`);
    return cacheResponse;
  }

  let response;

  try {
    response = await fetch(event.request);
    console.log(`Запрос выполнен через сеть: ${event.request.url}`);
    const cache = await caches.open(CACHE_NAME);
    cache.put(event.request, response.clone());
    return response;
  } catch (error) {
    console.warn(`Сеть недоступна, и нет кэша для: ${event.request.url}`);
    return new Response("Нет соединения", { status: 503 });
  }
}

/**
 * Стратегия: Сеть в приоритете, затем кэш
 */
async function fetchPriorityThenCache(event) {
  let response;

  try {
    response = await fetch(event.request);
    console.log(`Запрос выполнен через сеть: ${event.request.url}`);
    const cache = await caches.open(CACHE_NAME);
    cache.put(event.request, response.clone());
    return response;
  } catch (error) {
    console.warn(`Сеть недоступна, используем кэш: ${event.request.url}`);
    const cacheResponse = await caches.match(event.request);

    if (cacheResponse) {
      return cacheResponse;
    }

    console.warn(`Нет ни сети, ни кэша для: ${event.request.url}`);
    return new Response("Нет соединения", { status: 503 });
  }
}

/**
 * Стратегия: Сеть в приоритете, затем кэш, затем fallback-изображение
 */
async function fetchPriorityThenCacheThenImageFallback(event) {
  let response;

  try {
    response = await fetch(event.request);
    console.log(`Запрос выполнен через сеть: ${event.request.url}`);
  } catch (error) {
    console.warn(`Сеть недоступна, используем кэш: ${event.request.url}`);
    const cacheResponse = await caches.match(event.request);

    if (cacheResponse) {
      return cacheResponse;
    }

    console.warn(
      `Нет ни сети, ни кэша, используем fallback-изображение: ${event.request.url}`,
    );
    return await caches.match("./image/fallback/user.jpg");
  }

  // Сохраняем изображение в отдельный кеш
  // const cache = await caches.open("external-images");

  const cache = await caches.open(CACHE_NAME);
  cache.put(event.request, response.clone());

  return response;
}

self.addEventListener("fetch", (event) => {
  console.log(`Происходит запрос на сервер: ${event.request.url}`);

  const url = new URL(event.request.url);

  // Приоритетные статические файлы
  if (FETCH_PRIORITY_URLS.includes(url.pathname)) {
    event.respondWith(fetchPriorityThenCache(event));
    return;
  }

  // Запросы к API
  if (url.searchParams.get("method") === "allArticles") {
    event.respondWith(fetchPriorityThenCache(event));
    // event.respondWith(
    //   new NetworkFirst({
    //     cacheName: CACHE_NAME,
    //     networkTimeoutSeconds: 10,
    //   }).handle({ event }),
    // );
    return;
  }

  // Запросы изображений
  if (
    url.pathname.startsWith("/images/user") ||
    /\.(png|jpg|jpeg|gif|webp)$/i.test(url.pathname)
  ) {
    event.respondWith(fetchPriorityThenCacheThenImageFallback(event));
    return;
  }

  // Для всех остальных запросов
  event.respondWith(cachePriorityThenFetch(event));
});
