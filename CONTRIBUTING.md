# Contributing to Coding for MBA

Thank you for your interest in contributing to **Coding for MBA**! We welcome improvements to the curriculum, bug fixes, documentation updates, and new features.

Please take a moment to review this guide to ensure a smooth contribution process.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher.
- **npm**: Comes with Node.js.
- **Git**: For version control.

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/saint2706/Coding-For-MBA.git
   cd Coding-For-MBA
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173/` (or another port if 5173 is busy).

## 📁 Project Structure

- `src/`: Source code (React components, utilities, pages).
  - `components/`: Reusable UI components.
  - `utils/`: Core logic (content loading, Pyodide integration, state).
  - `stores/`: Zustand state stores.
- `content/lessons/`: Markdown content for the 108-day curriculum.
- `docs/`: Documentation files (Roadmap, Architecture).
- `scripts/`: Build and validation scripts.
- `tests/`: E2E tests (Playwright).

## 🛠️ Development Workflow

1. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**. Ensure you follow the project code style.

3. **Validate your changes**:
   - Run type checks: `npm run typecheck`
   - Format code: `npm run format`
   - Verify content integrity: `npm run validate-content`

4. **Commit your changes**:
   - Use clear, descriptive commit messages.
   - Example: `feat: Add new exercise widget for SQL` or `fix: Correct typo in Day 12 lesson`.

## ✅ Testing

We use **Vitest** for unit testing and **Playwright** for end-to-end testing.

- **Run unit tests**:
   ```bash
   npm test
   ```
- **Run unit tests in watch mode**:
   ```bash
   npm run test:watch
   ```
- **Run E2E tests**:
   ```bash
   npm run test:e2e
   ```
   *Note: E2E tests require the dev server to be running or built.*

## 🎨 Code Style

- **Prettier**: We enforce code formatting with Prettier. Run `npm run format` before committing.
- **TypeScript**: We use strict TypeScript configuration. Ensure `npm run typecheck` passes.
- **JSDoc**: Please add JSDoc comments to exported functions and components, describing their purpose, parameters, and return values.

## 📝 Pull Request Process

1. Push your branch to GitHub.
2. Open a Pull Request (PR) against the `main` branch.
3. Describe your changes clearly in the PR description.
4. Ensure all CI checks pass (Lint, Typecheck, Tests).
5. A maintainer will review your PR and may request changes.

## 📄 Documentation

- **User Documentation**: Located in `README.md`.
- **Architecture**: See `docs/ARCHITECTURE.md`.
- **Roadmap**: See `docs/todo.md`.
- **Content Strategy**: See `docs/content-expansion.md`.

Thank you for contributing!
