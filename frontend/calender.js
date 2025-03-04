document.addEventListener("DOMContentLoaded", function () {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");
  const calendar = document.getElementById("calendar");
  const selectedDateDisplay = document.getElementById("selected-date");
  const predictionContainer = document.getElementById("prediction-container");
  const weatherReport = document.getElementById("weather-report");

  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  // ✅ Backend API URL (matches your Flask app running on port 5001)
  const API_URL = "http://127.0.0.1:5001/predict_weather";

  function populateDropdowns() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    for (let i = 0; i < 12; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.textContent = months[i];
      monthSelect.appendChild(option);
    }
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      yearSelect.appendChild(option);
    }
    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;
  }

  function generateCalendar(month, year) {
    calendar.innerHTML = "";
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach((day) => {
      let header = document.createElement("div");
      header.classList.add("calendar-header");
      header.textContent = day;
      calendar.appendChild(header);
    });

    for (let i = 0; i < firstDay; i++) {
      let emptyCell = document.createElement("div");
      emptyCell.classList.add("empty-cell");
      calendar.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      let cell = document.createElement("div");
      cell.classList.add("calendar-day");
      cell.textContent = day;
      cell.addEventListener("click", function () {
        const selectedDate = new Date(year, month, day);
        selectedDateDisplay.textContent = `Selected Date: ${selectedDate.toDateString()}`;
        fetchWeatherPrediction(selectedDate);
      });
      calendar.appendChild(cell);
    }
  }

  async function fetchWeatherPrediction(date) {
    // ✅ Convert date to DD/MM/YYYY format as required by Flask API
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

    weatherReport.textContent = "Fetching data...";

    try {
      const response = await fetch(`${API_URL}?date=${formattedDate}`);
      const data = await response.json();

      if (response.ok) {
        weatherReport.innerHTML = `
                    <strong>Predicted Weather:</strong><br>
                    🌡️ Temperature: ${data[
                      "Temperature at 2 meters (c)"
                    ].toFixed(2)} °C<br>
                    🌧️ Precipitation: ${data[
                      "Precipitation Corrected (mm/day)"
                    ].toFixed(2)} mm/day<br>
                    💨 Wind Speed: ${data[
                      "Wind Speed at 2 Meters (m/s)"
                    ].toFixed(2)} m/s
                `;
      } else {
        weatherReport.textContent = "No prediction available.";
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      weatherReport.textContent = "Error fetching data.";
    }

    predictionContainer.style.display = "block";
  }

  monthSelect.addEventListener("change", () => {
    currentMonth = parseInt(monthSelect.value);
    generateCalendar(currentMonth, currentYear);
  });

  yearSelect.addEventListener("change", () => {
    currentYear = parseInt(yearSelect.value);
    generateCalendar(currentMonth, currentYear);
  });

  populateDropdowns();
  generateCalendar(currentMonth, currentYear);
});
