document.addEventListener("DOMContentLoaded", function () {
  const calendar = document.querySelector(".calendar");
  const calendarBody = document.getElementById("calendar-body");
  const monthTitle = document.getElementById("month-title");
  const yearSelector = document.getElementById("year-selector");
  const monthSelector = document.getElementById("month-selector");
  const saveBtn = document.getElementById("save-btn");

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

  fetch(`http://localhost:8888/rayz/load_schedule.php?year=${year}&month=${month + 1}`)
    .then(response => response.json())
    .then(data => {
      if (data.status !== "success") throw new Error(data.message || "Ошибка загрузки");

      const employees = data.employees;
      const shifts = data.shifts;

      // Обновляем заголовок месяца
      const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
      ];
      monthTitle.textContent = `${monthNames[month]} ${year}`;

      // Очищаем заголовки дней
      const thead = calendar.querySelector("thead tr");
      while (thead.children.length > 1) {
        thead.removeChild(thead.lastChild);
      }

      // Очищаем тело таблицы
      calendarBody.innerHTML = "";

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const now = new Date();
      const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

      // Создаем заголовки дней
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const th = document.createElement("th");
        th.textContent = day;

        const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
        const dayNameSpan = document.createElement("span");
        dayNameSpan.textContent = dayNames[dayOfWeek];
        dayNameSpan.style.display = "block";
        dayNameSpan.style.fontSize = "0.8em";
        dayNameSpan.style.color = (dayOfWeek === 0 || dayOfWeek === 6) ? "#d00" : "#666";
        th.insertBefore(dayNameSpan, th.firstChild);

        if (dayOfWeek === 0 || dayOfWeek === 6) th.classList.add("weekend");
        if (isCurrentMonth && day === now.getDate()) th.classList.add("today");

        thead.appendChild(th);
      }

      // Создаем строки сотрудников
      employees.forEach((employee) => {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        nameCell.className = "employee-name";
        nameCell.textContent = employee.last_name;
        row.appendChild(nameCell);

        for (let day = 1; day <= daysInMonth; day++) {
          const cell = document.createElement("td");
          cell.dataset.employeeId = employee.id;
          cell.dataset.day = day;

          const cellContent = document.createElement("div");
          cellContent.className = "cell-content";
          cell.appendChild(cellContent);

          const dropdown = document.createElement("div");
          dropdown.className = "dropdown-menu";

          shiftOptions.forEach((option) => {
            const item = document.createElement("div");
            item.className = `dropdown-item ${option.class}`;
            item.textContent = option.text;
            item.dataset.value = option.value;
            item.dataset.class = option.class;

            item.addEventListener("click", function () {
              const value = this.dataset.value;
              const valueClass = this.dataset.class;

              cellContent.innerHTML = "";
              if (value) {
                const valueSpan = document.createElement("span");
                valueSpan.className = `selected-value ${valueClass}`;
                valueSpan.textContent = this.textContent;
                cellContent.appendChild(valueSpan);
              }

              dropdown.classList.remove("show");
              cell.dataset.value = value;

              const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              saveShift(employee.id, formattedDate, value);
            });

            dropdown.appendChild(item);
          });

          cell.appendChild(dropdown);

          cell.addEventListener("click", function (e) {
            if (!e.target.closest(".dropdown-menu")) {
              document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
                if (menu !== dropdown) menu.classList.remove("show");
              });
              dropdown.classList.toggle("show");
            }
          });

          row.appendChild(cell);
        }

        calendarBody.appendChild(row);
      });

      // Проставляем смены
      shifts.forEach((shift) => {
        const date = new Date(shift.date);
        if (date.getFullYear() !== year || date.getMonth() !== month) return;

        const day = date.getDate();
        const cell = calendarBody.querySelector(
          `td[data-employee-id="${shift.employee_id}"][data-day="${day}"]`
        );
        if (!cell) return;

        const cellContent = cell.querySelector(".cell-content");
        const option = shiftOptions.find(opt => opt.value === shift.shift_type);
        if (option && cellContent) {
          const valueSpan = document.createElement("span");
          valueSpan.className = `selected-value ${option.class}`;
          valueSpan.textContent = option.text;
          cellContent.appendChild(valueSpan);
          cell.dataset.value = option.value;
        }
      });

    })
    .catch((error) => {
      console.error("Ошибка загрузки календаря:", error);
    });
  }


  function saveShift(employeeId, date, shiftType) {
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
    
    fetch('http://localhost:8888/rayz/save_shift.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_id: employeeId,
        date: date,
        shift_type: shiftType
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        notification.textContent = "Данные успешно сохранены!";
        notification.style.backgroundColor = "#4CAF50";

        // Автоматическое скрытие уведомления через 3 секунды
        setTimeout(() => {
          notification.style.transition = "opacity 1s";
          notification.style.opacity = "0";
          setTimeout(() => notification.remove(), 1000);
        }, 3000);
        console.log('Смена успешно сохранена');
      } else {
        console.error('Ошибка сохранения:', data.message);

        notification.textContent = "Ошибка сохранения: " + data.message;
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
      }
    })
    .catch(error => {
      console.error('Ошибка запроса:', error);
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
});
