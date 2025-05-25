document.addEventListener("DOMContentLoaded", function () {
  const calendar = document.querySelector(".calendar");
  const calendarBody = document.getElementById("calendar-body");
  const monthTitle = document.getElementById("month-title");
  const yearSelector = document.getElementById("year-selector");
  const monthSelector = document.getElementById("month-selector");
  const saveBtn = document.getElementById("save-btn");

  // Данные работников
  const employees = [
    { id: 1, name: "Иванов" },
    { id: 2, name: "Петров" },
    { id: 3, name: "Сидоров" },
    { id: 4, name: "Кузнецова" },
    { id: 5, name: "Смирнов" },
  ];

  // Варианты для выпадающего меню
  const shiftOptions = [
    { value: "", text: "-", class: "" },
    { value: "aircraft", text: "С", class: "aircraft" },
    { value: "maintenance", text: "Ц", class: "maintenance" },
    { value: "heavy", text: "Ч", class: "heavy" },
    { value: "study", text: "У", class: "study" },
  ];

  // Добавляем годы в селектор (от 2020 до 2030)
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 2; year <= currentYear + 3; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === currentYear) {
      option.selected = true;
    }
    yearSelector.appendChild(option);
  }

  // Устанавливаем текущий месяц по умолчанию
  monthSelector.selectedIndex = new Date().getMonth();

  // Функция для обновления календаря
  function updateCalendar() {
    const year = parseInt(yearSelector.value);
    const month = parseInt(monthSelector.value);

    // Обновляем заголовок
    const monthNames = [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ];
    monthTitle.textContent = `${monthNames[month]} ${year}`;

    // Очищаем заголовки дней
    const thead = calendar.querySelector("thead tr");
    while (thead.children.length > 1) {
      thead.removeChild(thead.lastChild);
    }

    // Очищаем тело таблицы
    calendarBody.innerHTML = "";

    // Получаем количество дней в выбранном месяце
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Получаем текущую дату для сравнения
    const now = new Date();
    const isCurrentMonth =
      year === now.getFullYear() && month === now.getMonth();

    // Создаем заголовки для дней месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay(); // 0 - воскресенье, 6 - суббота

      const th = document.createElement("th");
      th.textContent = day;

      // Добавляем название дня недели
      const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
      const dayNameSpan = document.createElement("span");
      dayNameSpan.textContent = dayNames[dayOfWeek];
      dayNameSpan.style.display = "block";
      dayNameSpan.style.fontSize = "0.8em";
      dayNameSpan.style.color =
        dayOfWeek === 0 || dayOfWeek === 6 ? "#d00" : "#666";

      th.insertBefore(dayNameSpan, th.firstChild);

      // Выделяем выходные
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        th.classList.add("weekend");
      }

      // Выделяем текущий день
      if (isCurrentMonth && day === now.getDate()) {
        th.classList.add("today");
      }

      thead.appendChild(th);
    }

    // Создаем строки для каждого работника
    employees.forEach((employee) => {
      const row = document.createElement("tr");

      // Ячейка с именем работника
      const nameCell = document.createElement("td");
      nameCell.className = "employee-name";
      nameCell.textContent = employee.name;
      row.appendChild(nameCell);

      // Создаем ячейки для каждого дня
      for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("td");
        cell.dataset.employeeId = employee.id;
        cell.dataset.day = day;

        // Содержимое ячейки
        const cellContent = document.createElement("div");
        cellContent.className = "cell-content";
        cell.appendChild(cellContent);

        // Выпадающее меню
        const dropdown = document.createElement("div");
        dropdown.className = "dropdown-menu";

        // Добавляем варианты в меню
        shiftOptions.forEach((option) => {
          const item = document.createElement("div");
          item.className = `dropdown-item ${option.class}`;
          item.textContent = option.text;
          item.dataset.value = option.value;
          item.dataset.class = option.class;

          item.addEventListener("click", function () {
            // Сохраняем выбранное значение
            const value = this.dataset.value;
            const valueClass = this.dataset.class;

            // Обновляем отображение ячейки
            cellContent.innerHTML = "";
            if (value) {
              const valueSpan = document.createElement("span");
              valueSpan.className = `selected-value ${valueClass}`;
              valueSpan.textContent = this.textContent;
              cellContent.appendChild(valueSpan);
            }

            // Скрываем меню
            dropdown.classList.remove("show");

            // Сохраняем данные в атрибуты
            cell.dataset.value = value;
          });

          dropdown.appendChild(item);
        });

        cell.appendChild(dropdown);

        // Обработчик клика по ячейке
        cell.addEventListener("click", function (e) {
          // Если клик был не по выпадающему меню
          if (!e.target.closest(".dropdown-menu")) {
            // Закрываем все открытые меню
            document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
              if (menu !== dropdown) menu.classList.remove("show");
            });

            // Показываем/скрываем текущее меню
            dropdown.classList.toggle("show");
          }
        });

        // Загружаем сохраненные данные (если есть)
        loadCellValue(cell, year, month, day, employee.id);

        row.appendChild(cell);
      }

      calendarBody.appendChild(row);
    });
  }

  // Функция для загрузки сохраненных значений ячеек
  function loadCellValue(cell, year, month, day, employeeId) {
    // Здесь можно добавить AJAX запрос к серверу для загрузки сохраненных данных
    // В демо-версии просто оставляем пустым
    // Пример загрузки данных:
    // fetch(`get_schedule.php?employee_id=${employeeId}&year=${year}&month=${month}&day=${day}`)
    // .then(response => response.json())
    // .then(data => {
    //     if (data.value) {
    //         const option = shiftOptions.find(opt => opt.value === data.value);
    //         if (option) {
    //             const valueSpan = document.createElement('span');
    //             valueSpan.className = `selected-value ${option.class}`;
    //             valueSpan.textContent = option.text;
    //             cell.querySelector('.cell-content').appendChild(valueSpan);
    //             cell.dataset.value = data.value;
    //         }
    //     }
    // })
    // .catch(error => console.error('Ошибка загрузки:', error));
  }

  // Функция для сохранения данных
  function saveSchedule() {
    const year = parseInt(yearSelector.value);
    const month = parseInt(monthSelector.value);
    const data = [];

    // Собираем данные из всех ячеек
    document
      .querySelectorAll("#calendar-body td[data-employee-id]")
      .forEach((cell) => {
        if (cell.dataset.value) {
          // Сохраняем только заполненные ячейки
          data.push({
            employee_id: cell.dataset.employeeId,
            year: year,
            month: month + 1, // Месяцы в JS 0-11, в БД обычно 1-12
            day: cell.dataset.day,
            value: cell.dataset.value,
          });
        }
      });

    // Отправляем данные на сервер
    sendDataToServer(data);
  }

  // Функция для отправки данных на сервер
  function sendDataToServer(data) {
    // Показываем уведомление о сохранении
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.right = "20px";
    notification.style.padding = "15px";
    notification.style.backgroundColor = "#4CAF50";
    notification.style.color = "white";
    notification.style.borderRadius = "4px";
    notification.style.zIndex = "1000";
    notification.textContent = "Сохранение данных...";
    document.body.appendChild(notification);

    // Пример AJAX запроса (раскомментируйте и настройте под свой сервер)
    fetch("save_schedule.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка сети");
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === "success") {
          notification.textContent = "Данные успешно сохранены!";
          notification.style.backgroundColor = "#4CAF50";

          // Автоматическое скрытие уведомления через 3 секунды
          setTimeout(() => {
            notification.style.transition = "opacity 1s";
            notification.style.opacity = "0";
            setTimeout(() => notification.remove(), 1000);
          }, 3000);
        } else {
          throw new Error(data.message || "Неизвестная ошибка");
        }
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        notification.textContent = "Ошибка: " + error.message;
        notification.style.backgroundColor = "#f44336";

        // Кнопка закрытия для уведомления об ошибке
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.style.marginLeft = "15px";
        closeBtn.style.background = "transparent";
        closeBtn.style.border = "none";
        closeBtn.style.color = "white";
        closeBtn.style.cursor = "pointer";
        closeBtn.onclick = () => notification.remove();
        notification.appendChild(closeBtn);
      });
  }

  // Закрытие меню при клике вне его
  document.addEventListener("click", function (e) {
    if (
      !e.target.closest(".dropdown-menu") &&
      !e.target.closest(".cell-content")
    ) {
      document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
        menu.classList.remove("show");
      });
    }
  });

  // Инициализируем календарь
  updateCalendar();

  // Добавляем обработчики событий для селекторов
  yearSelector.addEventListener("change", updateCalendar);
  monthSelector.addEventListener("change", updateCalendar);
  saveBtn.addEventListener("click", saveSchedule);
});
