// src/js/api.js
export async function fetchArticles() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    console.log("Начинаем запрос к серверу...");
    const response = await fetch("http://localhost:7070/?method=allArticles", {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Ошибка HTTP! Статус: ${response.status}, Текст: ${errorText}`,
      );
      throw new Error(
        `HTTP error! Status: ${response.status}, Body: ${errorText}`,
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error(
        `Некорректный формат данных: ${contentType}. Тело: ${errorText}`,
      );
      throw new TypeError(
        `Некорректный формат данных: ${contentType}. Body: ${errorText}`,
      );
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
