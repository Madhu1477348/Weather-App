const apiKey = "295d55f9c33da9da9144a5adbe41060f";

const searchInput = document.querySelector(".inputField");
const searchBtn = document.querySelector(".searchIcon");

searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city === "") {
    alert("Please enter a city name!");
    return;
  }
  getWeather(city);
  getForecast(city);
  getTodayForecast(city);
});

// ---------- CURRENT WEATHER ----------
async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();

    document.getElementById("cityName").innerText = data.name;
    document.getElementById("cityTemp").innerHTML = `${Math.round(data.main.temp)} &deg;C`;
    document.getElementById("skyDesc").innerText = data.weather[0].description;

    // 📅 Date & Time
    const date = new Date();
    document.querySelectorAll(".leftChild .d-flex.gap-3 h6")[0].innerText = date.toLocaleDateString();
    document.querySelectorAll(".leftChild .d-flex.gap-3 h6")[1].innerText =
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 🌬 Extra Metrics
    const metrics = document.querySelectorAll(".extraMetric");
    metrics[0].querySelector("h6:nth-child(1)").innerText = "Wind";
    metrics[0].querySelector("h6:nth-child(2)").innerText = data.wind.speed + " m/s";
    metrics[1].querySelector("h6:nth-child(1)").innerText = "Humidity";
    metrics[1].querySelector("h6:nth-child(2)").innerText = data.main.humidity + "%";
    metrics[2].querySelector("h6:nth-child(1)").innerText = "Pressure";
    metrics[2].querySelector("h6:nth-child(2)").innerText = data.main.pressure + " hPa";
    metrics[3].querySelector("h6:nth-child(1)").innerText = "Feels Like";
    metrics[3].querySelector("h6:nth-child(2)").innerText = Math.round(data.main.feels_like) + "°C";

    // 🌅 Sunrise & Sunset
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    document.querySelector(".sunriseDiv h5").innerText = sunrise;
    document.querySelector(".sunsetDiv h5").innerText = sunset;

    // 🌍 Fetch Air Quality
    getAirQuality(data.coord.lat, data.coord.lon);
  } catch (err) {
    alert(err.message);
  }
}

// ---------- AIR QUALITY INDEX ----------
async function getAirQuality(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Air quality data not available");
    const data = await res.json();

    const aqiData = data.list[0].components;
    const aqiDivs = document.querySelectorAll(".AQI .text-center");

    const gases = [
      { name: "CO (μg/m³)", value: aqiData.co },
      { name: "NO₂ (μg/m³)", value: aqiData.no2 },
      { name: "SO₂ (μg/m³)", value: aqiData.so2 },
      { name: "O₃ (μg/m³)", value: aqiData.o3 },
    ];

    gases.forEach((gas, i) => {
      if (aqiDivs[i]) {
        aqiDivs[i].querySelector("h6:nth-child(1)").innerText = gas.name;
        aqiDivs[i].querySelector("h6:nth-child(2)").innerText = gas.value.toFixed(1);
      }
    });
  } catch (err) {
    console.error("AQI Error:", err);
  }
}

// ---------- 5-DAY FORECAST ----------
async function getForecast(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Forecast not available");
    const data = await res.json();

    const forecastList = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
    const rows = document.querySelectorAll(".forecastRow");

    forecastList.slice(0, 5).forEach((day, i) => {
      const temp = Math.round(day.main.temp);
      const date = new Date(day.dt_txt);
      const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
      const formatted = date.toLocaleDateString("en-GB");
      if (rows[i]) {
        const tempEl = rows[i].querySelector(".d-flex.gap-1.align-items-center h6");
        if (tempEl) tempEl.innerHTML = `${temp} &deg;C`;
        const h6s = rows[i].querySelectorAll(":scope > h6");
        if (h6s.length >= 2) {
          h6s[0].innerText = weekday;
          h6s[1].innerText = formatted;
        }
        const iconCode = day.weather[0].icon;
        const iconEl = rows[i].querySelector("img");
        if (iconEl) iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
      }
    });
  } catch (err) {
    console.error("Forecast Error:", err);
  }
}

// ---------- TODAY'S HOURLY ----------
async function getTodayForecast(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Today's forecast not available");
    const data = await res.json();

    const today = new Date().toISOString().split("T")[0];
    const todayList = data.list.filter((item) => item.dt_txt.includes(today));

    const boxes = document.querySelectorAll(".todayTemp");
    todayList.slice(0, boxes.length).forEach((hourData, i) => {
      const temp = Math.round(hourData.main.temp);
      const time = new Date(hourData.dt_txt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const icon = hourData.weather[0].icon;
      if (boxes[i]) {
        boxes[i].querySelector("h6").innerText = time;
        boxes[i].querySelector("img").src = `https://openweathermap.org/img/wn/${icon}.png`;
        boxes[i].querySelector("h5").innerHTML = `${temp} &deg;C`;
      }
    });
  } catch (err) {
    console.error("Today's forecast error:", err);
  }
}
