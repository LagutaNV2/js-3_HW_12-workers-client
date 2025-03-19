// src/js/app.js
import { fetchArticles } from "./api.js";
import { showLoading, showError, showContent, renderArticles } from "./ui.js";

export async function initApp() {
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
      if (content) callback();
      else console.error("#content не найден после 5 секунд");
    }
    attempts++;
  }, 100);
}

document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .then((reg) => {
        console.log("SW registered:", reg);
        console.log("Registration succeeded. Scope:", reg.scope);
        reg.update();
      })
      .catch((error) => {
        console.log("Registration failed:", error);
      });
  }
  document.getElementById("refresh-button").addEventListener("click", initApp);
  waitForContent(initApp);
});
