// --- Config ---
const translations = {
  en: {
    title: "Weather",
    city: "City",
    enterCity: "Enter city",
    language: "Language",
    getWeather: "Get weather",
    geoWeather: "Get weather by location",
    temperature: "Temperature",
    feelsLike: "Feels like",
    description: "Description",
    wind: "Wind speed",
    humidity: "Humidity",
    cityNotFound: "City not found!",
    geoAccessDenied: "Access to geolocation denied.",
    error: "Something went wrong. Try again.",
  },
  ru: {
    title: "Погода",
    city: "Город",
    enterCity: "Введите город",
    language: "Язык",
    getWeather: "Показать погоду",
    geoWeather: "Погода по местоположению",
    temperature: "Температура",
    feelsLike: "Ощущается как",
    description: "Описание",
    wind: "Скорость ветра",
    humidity: "Влажность",
    cityNotFound: "Город не найден!",
    geoAccessDenied: "Доступ к геопозиции запрещен.",
    error: "Что-то пошло не так. Повторите попытку.",
  },
};

// --- DOM ---
const API_KEY = "c4976700f060276c1c1a1acf39d04ebc";
const UNSPLASH_KEY = "axiH7uT_DDF77FZFjTsxbw0Qtm0JZXv9dwcfxzwj_jc";
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

const cityValueInput = document.getElementById("cityValueInput");
const weatherBtn = document.getElementById("weatherBtn");
const weatherInfo = document.getElementById("weatherInfo");
const geoWeatherBtn = document.getElementById("geoWeatherBtn");
const langSelect = document.getElementById("langSelect");
const history = document.getElementById("history");

// --- Init language from localStorage (or default 'en') ---
const savedLang = localStorage.getItem("weatherLang") || "en";
langSelect.value = savedLang;
applyTranslations(savedLang);

// --- Load saved weather (if any) AFTER applying translations ---
document.addEventListener("DOMContentLoaded", async () => {
  const weatherJson = localStorage.getItem("weather");
  const data = weatherJson ? JSON.parse(weatherJson) : null;

  data ? showWeather(data) : await getGeoWeather();

  if (!localStorage.getItem("searchHistory")) {
    localStorage.setItem("searchHistory", JSON.stringify([]));
  }
});

// --- Events ---
weatherBtn.onclick = async () => await getWeather(cityValueInput.value.trim());

geoWeatherBtn.onclick = async () => await getGeoWeather();

langSelect.onchange = () => {
  const selectedLang = langSelect.value;
  applyTranslations(selectedLang);
  localStorage.setItem("weatherLang", selectedLang);

  // If weather data shows now - render them with new labels
  const currentWeatherJson = localStorage.getItem("weather");
  if (currentWeatherJson) {
    const currentData = JSON.parse(currentWeatherJson);
    showWeather(currentData);
  }
};

// --- Business logic ---
async function getGeoWeather() {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const { latitude, longitude } = position.coords;

    const data = await fetchWeather(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=${langSelect.value}`
    );

    showWeather(data);
  } catch (error) {
    handleError(error);
  }
}

async function getWeather(city) {
  if (!city) {
    alert(translations[langSelect.value].enterCity + "!");
    return;
  }

  try {
    const data = await fetchWeather(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${langSelect.value}`
    );
    localStorage.setItem("weather", JSON.stringify(data));
    pushToHistory("searchHistory", data.name);
    showWeather(data);
    cityValueInput.value = "";
  } catch (error) {
    handleError(error);
  }
}

// --- Render ---
async function showWeather(data) {
  renderWeather(data);
  await updateBackground(data);
  displayHistory();
}

function renderWeather({
  name,
  weather: [{ icon, description }],
  main: { temp, feels_like, humidity },
  wind: { speed },
}) {
  weatherInfo.innerHTML = "";

  const currentLang = langSelect.value;
  const t = translations[currentLang] || translations.en;
  const h2 = document.createElement("h2");
  h2.textContent = `${t.title} — ${name}`;
  weatherInfo.appendChild(h2);

  const img = document.createElement("img");
  img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  img.alt = "weather";
  weatherInfo.appendChild(img);

  weatherInfo.appendChild(createInfo("temperature", `${temp} °C`));
  weatherInfo.appendChild(createInfo("feelsLike", `${feels_like} °C`));
  weatherInfo.appendChild(createInfo("description", `${description}`));
  weatherInfo.appendChild(createInfo("wind", `${speed} m/s`));
  weatherInfo.appendChild(createInfo("humidity", `${humidity} %`));
}

async function updateBackground({ name, weather: [{ main }] }) {
  let query = name;
  const condition = main.toLowerCase();

  if (condition.includes("rain")) query += " rain city";
  if (condition.includes("snow")) query += " winter snow";
  if (condition.includes("cloud")) query += " cloudy skyline";
  if (condition.includes("clear")) query += " sunny city skyline";

  const photoUrl = await fetchCityImage(query);
  if (photoUrl) {
    setBackgroundImage(photoUrl);
  }
}

function displayHistory() {
  history.innerHTML = "";
  const searchHistory = getHistory("searchHistory");
  for (const city of searchHistory) {
    const btnHistory = document.createElement("button");
    btnHistory.textContent = city;
    btnHistory.style.margin = "5px";
    btnHistory.onclick = async () => await getWeather(city);
    history.appendChild(btnHistory);
  }
}

function createInfo(labelKey, value) {
  const label = getLabel(labelKey) || labelKey;
  const p = document.createElement("p");
  p.textContent = `${label}: ${value}`;
  return p;
}

// --- Helpers ---
async function fetchWeather(url) {
  weatherInfo.innerHTML = `<div class="spinner-border text-light" role="status">
  <span class="visually-hidden">Loading...</span>
  </div>`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();

  return data;
}

function handleError(error) {
  cityValueInput.value = "";
  if (error.message === "404") {
    alert(getLabel("cityNotFound"));
  } else if (error.code === 1) {
    alert(getLabel("geoAccessDenied"));
  } else {
    console.log(error);

    alert(getLabel("error"));
  }
}

function getLabel(labelKey) {
  const currentLang = langSelect.value;
  const dict = translations[currentLang] || translations.en;
  return dict[labelKey];
}

function applyTranslations(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation =
      (translations[lang] && translations[lang][key]) ||
      (translations.en && translations.en[key]) ||
      key;

    if (el.tagName === "INPUT") {
      el.placeholder = translation;
    } else {
      el.textContent = translation;
    }
  });
}

async function fetchCityImage(city) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    city
  )}&client_id=${UNSPLASH_KEY}&orientation=landscape&fm=jpg`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.results.length > 0) {
    return data.results[0].urls.regular + "&fm=jpg";
  }

  return "https://images.unsplash.com/photo-1503264116251-35a269479413&fm=jpg";
}

function setBackgroundImage(photoUrl) {
  const safeUrl = `${photoUrl}&fm=jpg&t=${Date.now()}`;

  if (isIOS) {
    setIOSBackground(safeUrl);
  } else {
    document.body.style.backgroundImage = `url('${safeUrl}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  }
}

function setIOSBackground(photoUrl) {
  let bg = document.getElementById("ios-bg");

  if (!bg) {
    bg = document.createElement("img");
    bg.id = "ios-bg";

    bg.style.position = "fixed";
    bg.style.top = "0";
    bg.style.left = "0";
    bg.style.width = "100%";
    bg.style.height = "100%";
    bg.style.objectFit = "cover";
    bg.style.zIndex = "-2";
    bg.style.transition = "opacity 1s ease";
    bg.style.opacity = "0";

    document.body.appendChild(bg);
  }

  bg.onload = () => {
    bg.style.opacity = "1";
  };

  bg.src = photoUrl;
}

function pushToHistory(key, value, limit = 3) {
  const arr = getHistory(key);

  if (!arr.includes(value)) {
    arr.push(value);
  }

  if (arr.length > limit) {
    arr.shift();
  }

  localStorage.setItem(key, JSON.stringify(arr));
}

function getHistory(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
