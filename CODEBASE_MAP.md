# Codebase Map

> **Generated**: 2026-01-21
> **Status**: Updated

## Navigation

**Start here:** `README.md` for setup and doc links.  
**Deep index:** `.agentlens/INDEX.md` (partial coverage).

**Related docs:**
- `docs/ARCHITECTURE.md`
- `docs/DATA_STORAGE.md`
- `docs/CONTRIBUTING.md`
- `resources/tech-stack.md`
- `resources/voice-tone.md`
- `resources/design-tokens.json`

## Architecture Overview

**Stack**:
- **Build**: Vite (ESM)
- **Frontend**: React + React Router
- **Styling**: Tailwind CSS + CSS variables (`app/src/index.css`)
- **State/Storage**: Local-first (IndexedDB primary + OPFS backup) via `app/src/data/storageService.js`
- **Testing**: Vitest

**Source layout**:
```
app/src/
├── app/          # Shell layout and chrome
├── data/         # Persistence, migrations, PDF export
├── features/     # Feature modules (projects, templates, device library, settings, help)
├── i18n/         # Translations + helpers
├── shared/       # Shared hooks/components/utils
├── App.jsx       # Routes + page orchestration
├── main.jsx      # React entry point
├── index.css     # Tailwind layers + design tokens
└── types.js      # JSDoc type definitions
```

## Feature Modules

- `app/src/features/projects/` - dashboard + workspace, crew, schedule
- `app/src/features/templates/` - template editor + apply flow
- `app/src/features/device-library/` - device list + editor
- `app/src/features/settings/` - backups, restore, factory reset
- `app/src/features/help/` - help and offline guidance

## Key Modules

| Area | Purpose | Path |
|---|---|---|
| App entry | Bootstraps React + router | `app/src/main.jsx` |
| App shell | Layout + sidebar/top chrome | `app/src/app/Layout.jsx` |
| Routes | Page wiring + handlers | `app/src/App.jsx` |
| Projects hook | Project CRUD + list logic | `app/src/shared/hooks/useProjects.js` |
| Templates hook | Template state + apply flow | `app/src/shared/hooks/useTemplates.js` |
| Storage hydration | Load/save orchestration + theme | `app/src/shared/hooks/useStorageHydration.js` |
| Storage facade | IndexedDB/OPFS + backups | `app/src/data/storageService.js` |
| PDF export | Build + download PDF | `app/src/data/pdf/pdfExportService.js` |
| i18n | Dictionaries + translation helpers | `app/src/i18n/index.js` |

## Build Output

The repo root contains built assets for GitHub Pages (`index.html`, `assets/`, `sw.js`, `manifest.webmanifest`). Source lives under `app/`.

## AgentLens Coverage

AgentLens docs exist for a limited subset of modules.
- `.agentlens/modules/root/MODULE.md`
- `.agentlens/modules/app-src-i18n/MODULE.md`
- `.agentlens/modules/app-src-components/MODULE.md` (legacy; components now live under `app/src/shared` and `app/src/features`)

---

*Map updated to reflect current feature-based structure.*
