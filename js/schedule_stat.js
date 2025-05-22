document.addEventListener("DOMContentLoaded", function () {
  const yearSelector = document.getElementById("year-selector");
  const analyticsBody = document.getElementById("analytics-body");

  // Данные работников (можно заменить на запрос к серверу)
  const employees = [
    { id: 1, name: "Иванов" },
    { id: 2, name: "Петров" },
    { id: 3, name: "Сидоров" },
    { id: 4, name: "Кузнецова" },
    { id: 5, name: "Смирнов" },
  ];

  // Заполняем селектор годов (текущий год и +/- 5 лет)
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    yearSelector.appendChild(option);
  }

  // Функция генерации случайных данных для демонстрации
//   function generateDemoData() {
//     const year = parseInt(yearSelector.value);
//     const data = {};

//     employees.forEach((employee) => {
//       data[employee.id] = {};
//       for (let month = 0; month < 12; month++) {
//         data[employee.id][month] = {
//           day: Math.floor(Math.random() * 10),
//           night: Math.floor(Math.random() * 8),
//           vacation: Math.floor(Math.random() * 3),
//           sick: Math.floor(Math.random() * 2),
//         };
//       }
//     });

//     return data;
//   }

  // Функция обновления таблицы аналитики
  function updateAnalytics() {
    // В реальном приложении здесь должен быть AJAX-запрос к серверу
    const year = parseInt(yearSelector.value);
    const analyticsData = generateDemoData(); // Замените на реальные данные

    analyticsBody.innerHTML = "";

    // Добавляем строки для каждого сотрудника
    employees.forEach((employee) => {
      const row = document.createElement("tr");

      // Ячейка с именем
      const nameCell = document.createElement("td");
      nameCell.className = "month-name";
      nameCell.textContent = employee.name;
      row.appendChild(nameCell);

      let yearlyTotal = 0;

      // Добавляем данные по месяцам
      for (let month = 0; month < 12; month++) {
        const monthData = analyticsData[employee.id][month];
        const total =
          monthData.day + monthData.night + monthData.vacation + monthData.sick;
        yearlyTotal += total;

        const cell = document.createElement("td");
        cell.textContent = total;
        row.appendChild(cell);
      }

      // Итоговая ячейка
      const totalCell = document.createElement("td");
      totalCell.textContent = yearlyTotal;
      totalCell.style.fontWeight = "bold";
      row.appendChild(totalCell);

      analyticsBody.appendChild(row);
    });

    // Добавляем итоговую строку
    addTotalRow();
  }

  // Функция добавления итоговой строки
  function addTotalRow() {
    const row = document.createElement("tr");
    row.className = "total-row";

    const labelCell = document.createElement("td");
    labelCell.textContent = "Всего";
    row.appendChild(labelCell);

    const monthlyTotals = Array(12).fill(0);
    let grandTotal = 0;

    // Считаем суммы по месяцам
    document.querySelectorAll("#analytics-body tr").forEach((tr) => {
      const cells = tr.querySelectorAll(
        "td:not(:first-child):not(:last-child)"
      );
      cells.forEach((cell, index) => {
        monthlyTotals[index] += parseInt(cell.textContent) || 0;
      });
    });

    // Добавляем ячейки с месячными итогами
    monthlyTotals.forEach((total) => {
      const cell = document.createElement("td");
      cell.textContent = total;
      grandTotal += total;
      row.appendChild(cell);
    });

    // Итоговая ячейка
    const totalCell = document.createElement("td");
    totalCell.textContent = grandTotal;
    row.appendChild(totalCell);

    analyticsBody.appendChild(row);
  }

  // Обработчик изменения года
  yearSelector.addEventListener("change", updateAnalytics);

  // Инициализация при загрузке
  updateAnalytics();
});

// В реальном приложении добавьте здесь функции для работы с сервером
// Например:
// async function loadAnalyticsData(year) {
//     const response = await fetch(`/api/analytics?year=${year}`);
//     return await response.json();
// }
