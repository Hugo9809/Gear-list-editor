---
trigger: always_on
---

ARCHITECTURAL STANDARDS (Vite + React)
1. Technology Stack (Immutable)
Build Tool: Vite (Native ESM).

Language: JavaScript (ES2022+ Modules). React (JSX).

State/Storage:
Primary: IndexedDB / OPFS (via storageService.js).
Data logic should reside in `app/src/data/`.

Styling: CSS Modules or global CSS (app/src/index.css).

2. Directory Structure
Adhere to the following structure for scalability:

app/src/components/: Contains UI components.
- High-level views (e.g., ProjectDashboard.jsx, ProjectWorkspace.jsx).
- Reusable atoms (e.g., TypeaheadInput.jsx).

app/src/data/: Data persistence and storage logic.
- Service layers (storageService.js).
- Migrations (migrate.js).

app/src/hooks/: Custom React hooks.

app/src/utils/: Utility functions.

app/src/i18n/: Translation files.

3. Code Standards
- Use functional components and Hooks.
- Avoid prop drilling; use Context or Composition where appropriate.
- Ensure all storage operations go through the defined data services in `app/src/data`.
