const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
  // Можно добавить сохранение состояния в localStorage
});

// 1. Проверяем системные настройки (только если пользователь ещё не выбирал тему вручную)
if (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: light)').matches) {
  document.documentElement.setAttribute('data-theme', 'light');
}

// 2. Применяем сохранённую тему (если есть)
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// 3. Вешаем обработчик на кнопку переключения
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? null : 'light'; // null = тёмная тема по умолчанию
  
  if (newTheme) {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  }
});