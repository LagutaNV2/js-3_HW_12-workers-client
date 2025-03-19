// src/service-worker.js
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";

const FETCH_PRIORITY_URLS = [
  "/", // Главная страница
  "/index.html", // HTML-файл
  "/src/css/style.css", // Основной CSS
  "/src/js/app.js", // Основной JS
];

// Логирование событий Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker установлен, событие: ", event);

  event.waitUntil(
    caches.open("my-best-cache").then((cache) => {
      cache.addAll([
        "./", // Корневой путь
        "./index.html", // Главная страница
        "./src/css/style.css", // Основной CSS
        "./src/js/app.js", // Основной JS
        "./image/fallback/user.jpg", // Fallback-изображ
      ]);
    }),
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker активирован, событие:", event);
  // event.waitUntil(self.clients.claim());
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
  } catch (error) {
    console.warn(`Сеть недоступна, и нет кэша для: ${event.request.url}`);
    return new Response("Нет соединения", { status: 503 });
  }

  const cache = await caches.open("my-best-cache");
  cache.put(event.request, response.clone());

  return response;
}

/**
 * Стратегия: Сеть в приоритете, затем кэш
 */
async function fetchPriorityThenCache(event) {
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

    return new Response("Нет соединения", { status: 503 });
  }

  const cache = await caches.open("my-best-cache");
  cache.put(event.request, response.clone());

  return response;
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

  const cache = await caches.open("my-best-cache");
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
  // if (url.searchParams.get("method") === "allArticles") {
  //   event.respondWith(fetchPriorityThenCache(event));
  //   return;
  // }

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
