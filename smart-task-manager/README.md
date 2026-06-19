# Smart Task Manager

A modern, responsive task management web application built with vanilla HTML5, CSS3, and JavaScript. All data is persisted in the browser's `localStorage` — no backend required.

![Smart Task Manager](https://img.shields.io/badge/Version-1.0-6366f1) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## ✨ Features

### Core
- **Add Tasks** — Create tasks with title, priority, and optional due date
- **Complete Tasks** — Toggle between pending and completed states
- **Delete Tasks** — Remove tasks with smooth slide-out animation
- **View Pending** — Dedicated section for incomplete tasks
- **View Completed** — Dedicated section for finished tasks
- **Task Counter** — Live count of total, pending, and completed tasks

### Bonus
- **🔍 Search** — Real-time filtering across all tasks
- **⚡ Priority Levels** — High, Medium, Low with color-coded badges
- **📅 Due Dates** — Date picker with overdue highlighting
- **🌙 Dark Mode** — Toggle between light and dark themes (preference persisted)

---

## 🚀 Getting Started

### Prerequisites
A modern web browser (Chrome, Firefox, Edge, Safari).

### Installation
1. Clone or download this repository
2. Open `index.html` in your browser

```bash
# No build step required!
# Simply open index.html in any browser
```

---

## 📂 Project Structure

```
smart-task-manager/
├── index.html          # Main HTML page
├── css/
│   └── styles.css      # Design system, themes, responsive layout
├── js/
│   └── app.js          # Application logic, localStorage, DOM rendering
├── README.md           # This file
└── docs/
    └── testing-report.md  # QA testing report
```

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic elements) |
| Styling | Vanilla CSS3 (custom properties, flexbox, animations) |
| Logic | Vanilla JavaScript (ES6+) |
| Persistence | `localStorage` API |
| Typography | Google Fonts — Inter |
| Icons | Inline SVG |

---

## 🎨 Design Highlights

- **Glassmorphism** — Semi-transparent cards with `backdrop-filter: blur()`
- **Micro-Animations** — Slide-in for new tasks, slide-out for deletions, shake on validation error
- **Color-Coded Priorities** — High (red), Medium (amber), Low (teal)
- **Overdue Highlighting** — Past-due tasks flagged in red
- **Responsive** — Fully adapts to mobile screens (< 600px)
- **Custom Scrollbar** — Styled to match the theme

---

## 📝 Data Model

Each task is stored as a JSON object:

```json
{
  "id": "lxyz123-abc4567",
  "title": "Review pull request",
  "priority": "high",
  "dueDate": "2026-06-20",
  "completed": false,
  "createdAt": "2026-06-19T12:00:00.000Z"
}
```

---

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
