# Codebase Map

> Generated: 2026-01-25
> Status: Updated

## Navigation

Start here: `README.md` for setup, contribution, and project overview.
Deep index: `app/src/` (frontend) and `src/` (core library) for quick navigation.

Related docs:
- `docs/ARCHITECTURE.md`
- `docs/DATA_STORAGE.md`
- `docs/CONTRIBUTING.md`
- `resources/tech-stack.md`
- `resources/voice-tone.md`
- `resources/design-tokens.json`

## Architecture Overview

Stack:
- Build: Vite (ESM)
- Frontend: React + React Router
- Styling: Tailwind CSS + CSS variables (`app/src/index.css`)
- State/Storage: Local-first (IndexedDB primary + OPFS backup) via `app/src/data/storageService.js`
- Testing: Vitest

Source layout:
- Frontend app: `app/src/`
- Core library: `src/`

App (frontend) modules:
- App shell & routes: `app/src/App.jsx`, `app/src/main.jsx`, `app/src/app/Layout.jsx`
- Feature areas: `app/src/features/projects/`, `app/src/features/templates/`, `app/src/features/device-library/`, `app/src/features/settings/`, `app/src/features/help/`
- Shared UI & hooks: `app/src/shared/hooks/*`, `app/src/shared/components/*`
- Internationalization: `app/src/i18n/en.json`, `app/src/i18n/de.json`
- Data layer: `app/src/data/storageService.js`, `app/src/data/pdf/pdfExportService.js`
- Design system & tokens: `app/src/design-system/tokens.json`, `app/src/index.css`
- Source type definitions: `app/src/types.js`

Core library (OpenCode gear-editor-skills):
- Core entry: `src/core/index.ts`, `src/core.ts`
- Domain model: `src/domain/`, `src/domain/README.md`
- Application logic: `src/application/`, `src/infra/`
- Rules & engines: `src/rules/`, `src/rules/engine.ts`
- Skills: `src/skills/`, `src/skills/index.ts`, `src/skills/skill.ts`, `src/skills/cinePowerPlanner.ts`
- Builder / bootstrap: `src/openCode.ts`, `src/README-ui-design.md`
- Design tokens: `src/design-system/tokens.json`
- Tests: `tests/domain.test.ts`
- Build config: `vitest.config.ts`

Build outputs:
- Frontend build artifacts live under `app/dist/` (static assets, index.html, sw.js, manifest)
- Root serves prebuilt assets via `index.html` and `assets/` (GitHub Pages)

AgentLens coverage:
- Coverage exists for a subset of modules; see `.agentlens/` for module docs where available. (If not present, this is an intentionally lightweight map.)

---
Map updated to reflect current project structure (frontend app + core skills library). Next steps: optionally add auto-generation of this map.
