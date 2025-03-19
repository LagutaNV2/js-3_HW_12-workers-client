// src/js/ui.js

export function showLoading() {
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
      articlePlaceholder.insertAdjacentHTML(
        "beforeend",
        articlePlaceholderHTML,
      );
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

export function showError() {
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

export function showContent() {
  const loadingScreen = document.getElementById("loading-screen");
  const content = document.getElementById("content");

  if (!content || !loadingScreen) {
    console.error("Элементы не найдены в DOM");
    return;
  }

  content.classList.add("loaded");
}

export function renderArticles(articles) {
  const content = document.getElementById("content");
  if (!content) {
    console.error("Элемент #content не найден в DOM");
    return;
  }
  content.innerHTML = "";

  articles.forEach((article) => {
    const articleElement = document.createElement("article");
    articleElement.className = "article";
    const articleHTML = `
      <div class="article-header">
        <h2>${article.title}</h2>
      </div>
      <div class="article-body">
        <img src="${article.preview}" class="preview">
        <div class="text">
          ${article.content.map((p) => `<p>${p}</p>`).join("")}
        </div>
      </div>
    `;
    articleElement.insertAdjacentHTML("beforeend", articleHTML);
    content.appendChild(articleElement);
  });
}
