# Architecture Overview

> **Stack**: Vite + React + Tailwind CSS
> **Architecture**: Local-First (IndexedDB + OPFS)

## 🏗️ Technology Stack

- **Build Tool**: [Vite](https://vitejs.dev/) (Native ESM)
- **Frontend Framework**: [React](https://react.dev/) (JSX, Functional Components, Hooks)
- **Language**: JavaScript (ES2022+ Modules)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + CSS Modules / Global CSS (`app/src/index.css`)
- **State & Storage**:
  - **IndexedDB**: structured data (projects, gear lists).
  - **OPFS (Origin Private File System)**: massive binary storage (PDF backups, images).
  - Logic resides in `app/src/data/`.

## 📂 Directory Structure

The application source code is located in `app/src/`.

```
app/src/
├── components/ # UI Components (Atoms, Molecules, Views)
│   ├── shared/ # Reusable UI atoms (inputs, buttons)
│   └── features/ # Domain-specific components
├── data/       # Data Layer
│   ├── persistence/ # DB adapters
│   ├── migrate.js   # DB migration logic
│   └── storageService.js # Main point of contact for data
├── features/   # Feature-grouped modules
├── hooks/      # Custom React Hooks
├── utils/      # Shared Utilities
└── i18n/       # Internationalization (de/en locales)
```

## 🗝️ Key Concepts

### Local-First Data
This application is designed to work 100% offline. It does not rely on a backend database.
- **Auto-Save**: Changes are persisted immediately to IndexedDB.
- **Redundancy**: Critical data is mirrored to OPFS for crash recovery.
- **Export/Import**: Full project state can be exported to a JSON/Zip file for backup or transfer.

### Module Architecture
We use a feature-based folder structure where possible, keeping related logic (components, hooks, utils) close together.
Shared infrastructure (like `storageService`) lives in `data/` or `shared/` to avoid circular dependencies.
