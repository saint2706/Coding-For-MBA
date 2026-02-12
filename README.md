# Coding for MBA

> A structured 108-day interactive learning platform covering Python, Data Science, Machine Learning, Business Intelligence, and Enterprise SQL — designed for business professionals.

[![Deploy](https://github.com/saint2706/Coding-For-MBA/actions/workflows/deploy.yml/badge.svg)](https://github.com/saint2706/Coding-For-MBA/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite)](https://vite.dev/)

## 🌐 Live Demo

**[saint2706.github.io/Coding-For-MBA](https://saint2706.github.io/Coding-For-MBA)**

## 🚢 Deployment Environments

- **Primary production environment:** GitHub Pages via `.github/workflows/deploy.yml`.
- **Surge (`coding-for-mba.surge.sh`) usage:** optional preview/release deployment, triggered manually (`workflow_dispatch`) or on published GitHub releases.
- **Default behavior:** pushes to `main` continue to rely on the GitHub Pages deployment workflow.

## 📚 What's Inside

| Phase | Topic                       | Days   |
| ----- | --------------------------- | ------ |
| 1     | Python Foundations          | 1–12   |
| 2     | Functions & Modularity      | 13–24  |
| 3     | Data Engineering & Web Dev  | 25–36  |
| 4     | Math & ML Foundations       | 37–48  |
| 5     | Advanced ML & Deep Learning | 49–60  |
| 6     | Cutting-Edge ML             | 61–72  |
| 7     | BI & Analytics              | 73–84  |
| 8     | SQL Mastery                 | 85–96  |
| 9     | Enterprise SQL              | 97–108 |

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router (HashRouter for GH Pages)
- **Markdown**: react-markdown + remark-gfm + rehype-raw
- **Syntax Highlighting**: react-syntax-highlighter (Prism)
- **Styling**: Vanilla CSS with custom design system
- **Deployment**: GitHub Pages via GitHub Actions

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/saint2706/Coding-For-MBA.git
cd Coding-For-MBA

# Install dependencies
npm install

# Start dev server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── MarkdownRenderer.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── pages/             # Route-level page components
│   ├── Home.tsx
│   ├── Curriculum.tsx
│   ├── Lesson.tsx
│   └── PhaseOverview.tsx
├── styles/            # Modular CSS files
│   ├── index.css      # Barrel import
│   ├── variables.css  # Design tokens
│   ├── base.css       # Reset & layout
│   └── ...            # Per-component styles
├── utils/
│   └── contentLoader.ts  # Markdown parser & data layer
├── App.tsx
└── main.tsx
Lessons/               # 108 lesson markdown files
```

## 📜 Available Scripts

| Script                 | Description                   |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Start Vite dev server         |
| `npm run build`        | Type-check + production build |
| `npm run lint`         | Run ESLint                    |
| `npm run typecheck`    | Run TypeScript compiler check |
| `npm run format`       | Format code with Prettier     |
| `npm run format:check` | Verify formatting             |
| `npm run deploy`       | Deploy to GitHub Pages        |

## 📄 License

This project is open source for educational purposes.
