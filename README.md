## 🌦 Weather App

A modern **Weather Application** built with **vanilla JavaScript**, focused on **clean architecture, internationalization (i18n)**, and **real-world browser compatibility**.

This project goes beyond a simple weather demo and demonstrates production-oriented frontend practices: API abstraction, graceful error handling, iOS fallbacks, dynamic UI updates, and scalable structure.

## ✨ Features

🌍 Current weather by city name

📍 Weather by geolocation

🖼 Dynamic city background images via Unsplash API

📱 iOS Safari fallback for background images

🌐 Multi-language UI (i18n) with runtime switching

💾 Persistent state using localStorage

🕓 Search history with quick access

⏳ Loading indicators and user-friendly error handling

🎨 Modern glassmorphism UI with responsive design

## 🛠 Tech Stack

* **JavaScript (ES6+)**

* **HTML5**

* **CSS3** (Glassmorphism, responsive layout)

* **OpenWeatherMap API** — weather data

* **Unsplash API** — city background images

* **Browser APIs**: Geolocation, LocalStorage

No frameworks, no build tools — pure, readable vanilla JS.

## 🧠 Architecture Overview

The application is structured around *separation of concerns*:

* **API layer** — responsible only for data fetching

* **Business logic** — state, history, language handling

* **UI rendering** — pure DOM updates

* **Helpers / utilities** — reusable cross-cutting logic

This makes the codebase:

* Easy to read

* Easy to refactor

* Easy to extend

## 🌐 Internationalization (i18n)

UI localization is implemented via:

* Centralized translations object

* data-i18n attributes in HTML

* Runtime language switching

* Automatic re-rendering on language change

Supported languages:

* 🇬🇧 English

* 🇷🇺 Russian

The architecture allows adding new languages with minimal effort.

## 🍏 iOS Safari Compatibility

Safari on iOS has known issues with dynamic background-image updates.

To ensure compatibility:

* iOS devices are detected via navigator.userAgent

* On iOS, a fixed <img> element is used instead of background-image

* WebP images are avoided in favor of JPG

* Cache-busting is applied to prevent stale images

This guarantees consistent behavior across *all major platforms*.

## 📦 Project Structure

```text
├── index.html # Application markup
├── style.css # UI styles
├── script.js # Application logic
└── README.md # Project documentation
```

## 🎯 Why This Project Matters

This app demonstrates:

* Real-world API integration

* Browser-specific problem solving

* Clean, maintainable frontend code

* UX-focused design decisions

* Growth-oriented architecture

It is well-suited for:

* Portfolio showcase

* Technical interviews

* Further extension into a full product