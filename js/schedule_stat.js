document.addEventListener("DOMContentLoaded", function () {
  const yearSelector = document.getElementById("year-selector");
  const analyticsBody = document.getElementById("analytics-body");

  // Заполняем селектор годов (текущий год и +/- 5 лет)
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    yearSelector.appendChild(option);
  }

  // Загрузка и отображение статистики
  async function updateAnalytics() {
    const year = parseInt(yearSelector.value);

    try {
      const response = await fetch(`http://localhost:8888/rayz/api/load_stat.php?year=${year}`);
      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(data.message || "Ошибка загрузки статистики");
      }

      renderAnalyticsTable(data.employees);
    } catch (error) {
      console.error("Ошибка при получении статистики:", error);
      analyticsBody.innerHTML = `<tr><td colspan="6" style="color: red;">Ошибка загрузки данных</td></tr>`;
    }
  }

  function renderAnalyticsTable(employees) {
    analyticsBody.innerHTML = "";

    employees.forEach((emp) => {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = emp.employee;
      row.appendChild(nameCell);

      const aircraftCell = document.createElement("td");
      aircraftCell.textContent = emp.aircraft;
      row.appendChild(aircraftCell);

      const maintenanceCell = document.createElement("td");
      maintenanceCell.textContent = emp.maintenance;
      row.appendChild(maintenanceCell);

      const heavyCell = document.createElement("td");
      heavyCell.textContent = emp.heavy;
      row.appendChild(heavyCell);

      const studyCell = document.createElement("td");
      studyCell.textContent = emp.study;
      row.appendChild(studyCell);

      const totalCell = document.createElement("td");
      totalCell.textContent = emp.total;
      totalCell.style.fontWeight = "bold";
      row.appendChild(totalCell);

      analyticsBody.appendChild(row);
    });

    renderTotalRow();
  }

  function renderTotalRow() {
    const totals = {
      aircraft: 0,
      maintenance: 0,
      heavy: 0,
      study: 0,
      total: 0
    };

    document.querySelectorAll("#analytics-body tr").forEach((tr) => {
      const cells = tr.querySelectorAll("td");
      totals.aircraft += parseInt(cells[1].textContent) || 0;
      totals.maintenance += parseInt(cells[2].textContent) || 0;
      totals.heavy += parseInt(cells[3].textContent) || 0;
      totals.study += parseInt(cells[4].textContent) || 0;
      totals.total += parseInt(cells[5].textContent) || 0;
    });

    const row = document.createElement("tr");
    row.className = "total-row";

    const labelCell = document.createElement("td");
    labelCell.textContent = "Всего";
    row.appendChild(labelCell);

    ["aircraft", "maintenance", "heavy", "study", "total"].forEach((key) => {
      const cell = document.createElement("td");
      cell.textContent = totals[key];
      row.appendChild(cell);
    });

    analyticsBody.appendChild(row);
  }

  // Инициализация
  yearSelector.addEventListener("change", updateAnalytics);
  updateAnalytics();
});