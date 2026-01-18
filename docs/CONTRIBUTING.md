# Contributing

Thank you for your interest in contributing to **Gear List Editor**!

## 🛠️ Development Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Hugo9809/Gear-list-editor.git
    cd Gear-list-editor/app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173/Gear-list-editor/`.

## ✅ Definition of Done

A feature or bug fix is considered **complete** when it meets the following criteria:

-   **Zero `// TODO` comments**: All logic must be fully implemented.
-   **Unit Tests**: Mandatory coverage for primary logic and utility functions.
-   **Integration Tests**: Verify component interactions (e.g., "Clicking Save writes to IndexedDB").
-   **Edge Cases**: At least one failure scenario is tested (e.g., storage quota full, invalid input).

## 🧪 Running Tests

```bash
npm test
```

This runs the Vitest test suite.

## 💅 Code Style

-   **Language**: JavaScript (ES2022+ Modules)
-   **Components**: Functional React components with Hooks. Avoid class-based components.
-   **Structure**: Follow the existing directory structure. Domain-specific logic belongs in `features/`, shared utilities in `shared/` or `utils/`.

## 📝 Commit Messages

We recommend [Conventional Commits](https://www.conventionalcommits.org/) for clear, standardized commit messages.

**Format:** `<type>(<scope>): <description>`

**Examples:**
-   `feat(storage): add OPFS backup layer`
-   `fix(ui): correct button alignment on dashboard`
-   `docs(readme): update quick start section`

## 🔀 Pull Requests

1.  Create a new branch from `main`.
2.  Make your changes.
3.  Ensure all tests pass (`npm test`).
4.  Create a Pull Request with a clear description of your changes.
