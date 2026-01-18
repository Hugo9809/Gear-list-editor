# Architectural Improvement Plan

## Goal
To refactor the application into a scalable, maintainable architecture that supports future expansion. The current state relies on a monolithic `App.jsx` and a flat component structure, which hinders development and testing.

## Current State Analysis
- **Monolithic `App.jsx`**: Handles routing, complex state, and UI layout.
- **Flat Structure**: All components are mixed in `src/components`.
- **Prop Drilling**: Global state (Theme, I18n) is passed manually through props.
- **No Testing**: Zero automated tests found for React components.

## Proposed Changes

### 1. Feature-Based Directory Structure
Move away from technical grouping (components/hooks) to domain grouping (features).

**New Structure:**
```
src/
  app/            # App-wide configurations (routes, stores)
  features/       # Feature domains
    projects/     # Dashboard, Workspace
    templates/    # Template management
    settings/     # Settings panel
  shared/         # Reusable UI, hooks, utils
    components/   # Generic UI (Button, Input)
    hooks/
    utils/
```

### 2. Infrastructure & Tooling
- **Testing**: Install `vitest`, `jsdom`, and `@testing-library/react`.
- **Routing**: Install `react-router-dom` to manage navigation declaratively vs state-based.

### 3. State Management Refactor
- Create `ThemeProvider` and `I18nProvider` to eliminate prop drilling for global concerns.
- Use `Outlet` from React Router for layout management.

## Plan Steps

### Step 1: Testing Infrastructure (Safety Net)
- [NEW] `test/setup.js`
- [MODIFY] `package.json` (add scripts/deps)
- [MODIFY] `vite.config.js`

### Step 2: Extract Shared Components
- [MOVE] `TypeaheadInput.jsx` -> `src/shared/components/`
- [MOVE] `HelpPanel.jsx` -> `src/features/help/` (or shared)

### Step 3: Feature Modules
- [MOVE] `ProjectDashboard.jsx`, `ProjectWorkspace.jsx` -> `src/features/projects/`
- [MOVE] `TemplateManager.jsx` -> `src/features/templates/`
- [MOVE] `SettingsPanel.jsx` -> `src/features/settings/`

### Step 4: Routing & App Refactor
- [NEW] `src/app/routes.jsx`
- [NEW] `src/app/Layout.jsx`
- [MODIFY] `App.jsx` (drastically simplify)

## Verification Plan
### Automated Tests
- Run `npm run test` to verify the new test setup works.
- Write a smoke test for the App rendering.

### Manual Verification
- Verify all tabs (Dashboard, Templates, Settings) still work via the new Router.
- Verify "Factory Reset" and "Export" features still function.
