/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/js/api.js
// src/js/api.js
async function fetchArticles() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    console.log("Начинаем запрос к серверу...");
    const response = await fetch("http://localhost:7070/?method=allArticles", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ошибка HTTP! Статус: ${response.status}, Текст: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error(`Некорректный формат данных: ${contentType}. Тело: ${errorText}`);
      throw new TypeError(`Некорректный формат данных: ${contentType}. Body: ${errorText}`);
    }
    const data = await response.json();
    console.log("Полученные данные:", data);
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Запрос отменен из-за таймаута");
    } else {
      console.error("Ошибка загрузки статей:", error.message);
    }
    return null;
  }
}
;// ./src/js/ui.js
// src/js/ui.js

function showLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  const content = document.getElementById("content");
  if (!loadingScreen || !content) {
    console.error("Элементы не найдены в DOM");
    return;
  }

  // Очищаем контент и добавляем плейсхолдеры
  if (content) {
    loadingScreen.style.display = "flex";
    content.innerHTML = "";
    const placeholderCount = 5;
    for (let i = 0; i < placeholderCount; i++) {
      const articlePlaceholder = document.createElement("div");
      articlePlaceholder.className = "article placeholder";
      let articlePlaceholderHTML = `
        <div class="article-header">
          <div class="placeholder title">&nbsp;</div>
        </div>
        <div class="article-body">
          <div class="preview-placeholder"></div>
          <div class="text-placeholder">
            <div class="paragraph">&nbsp;</div>
            <div class="paragraph">&nbsp;</div>
            <div class="paragraph">&nbsp;</div>
          </div>
        </div>
      `;
      articlePlaceholder.insertAdjacentHTML("beforeend", articlePlaceholderHTML);
      content.appendChild(articlePlaceholder);
    }
  }

  // Скрываем контент- закоментировано
  // content.classList.add("hidden");

  // Если загрузка не завершена через 10 секунд — показать ошибку
  setTimeout(() => {
    if (!content?.classList.contains("loaded")) {
      showError();
    }
  }, 10000);
}
function showError() {
  const loadingScreen = document.getElementById("loading-screen");
  const content = document.getElementById("content");
  if (!loadingScreen || !content) {
    console.error("Элементы не найдены в DOM");
    return;
  }
  const errorHTML = `
    <div class="error-container">
      <p class="error-message">⚠️ Не удалось загрузить данные </p>
      <br>
      <p class="error-message">Проверьте подключение и обновите страницу</p>
      <button id="retry-button" class="retry-button">Повторить попытку</button>

    </div>
  `;
  // Добавляем ошибку в существующий контент
  content.innerHTML = "";
  content.insertAdjacentHTML("beforeend", errorHTML);
  loadingScreen.style.display = "flex";
  const retryButton = document.getElementById("retry-button");
  if (retryButton) {
    retryButton.addEventListener("click", () => {
      showLoading(); // Повторная попытка загрузки данных
    });
  }
}
function showContent() {
  const loadingScreen = document.getElementById("loading-screen");
  const content = document.getElementById("content");
  if (!content || !loadingScreen) {
    console.error("Элементы не найдены в DOM");
    return;
  }
  content.classList.add("loaded");
}
function renderArticles(articles) {
  const content = document.getElementById("content");
  if (!content) {
    console.error("Элемент #content не найден в DOM");
    return;
  }
  content.innerHTML = "";
  articles.forEach(article => {
    const articleElement = document.createElement("article");
    articleElement.className = "article";
    const articleHTML = `
      <div class="article-header">
        <h2>${article.title}</h2>
      </div>
      <div class="article-body">
        <img src="${article.preview}" class="preview">
        <div class="text">
          ${article.content.map(p => `<p>${p}</p>`).join("")}
        </div>
      </div>
    `;
    articleElement.insertAdjacentHTML("beforeend", articleHTML);
    content.appendChild(articleElement);
  });
}
;// ./src/js/app.js
// src/js/app.js


async function initApp() {
  showLoading(); // Показываем экран загрузки

  const articles = await fetchArticles();
  if (articles) {
    renderArticles(articles);
    showContent(); // Скрываем экран загрузки
  } else {
    showError(); // Показываем сообщение об ошибке
  }
}
function waitForContent(callback) {
  let attempts = 0;
  const maxAttempts = 50;
  const interval = setInterval(() => {
    const content = document.getElementById("content");
    console.log("Поиск #content...", content);
    if (content || attempts >= maxAttempts) {
      clearInterval(interval);
      if (content) callback();else console.error("#content не найден после 5 секунд");
    }
    attempts++;
  }, 100);
}
document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js", {
      scope: "/",
      updateViaCache: "none"
    }).then(reg => {
      console.log("SW registered:", reg);
      console.log("Registration succeeded. Scope:", reg.scope);
      reg.update();
    }).catch(error => {
      console.log("Registration failed:", error);
    });
  }
  document.getElementById("refresh-button").addEventListener("click", initApp);
  waitForContent(initApp);
});
;// ./src/index.js



// TODO: write your code in app.js
/******/ })()
;