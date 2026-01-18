# Imports

[← Back to MODULE](MODULE.md) | [← Back to INDEX](../../INDEX.md)

## Dependency Graph

```mermaid
graph TD
    root[root] --> data[data]
    root[root] --> i18n[i18n]
    root[root] --> __[..]
    root[root] --> data[data]
    root[root] --> _[.]
    root[root] --> components[components]
    root[root] --> components[components]
    root[root] --> components[components]
    root[root] --> components[components]
    root[root] --> components[components]
    root[root] --> hooks[hooks]
    root[root] --> hooks[hooks]
    root[root] --> hooks[hooks]
    root[root] --> i18n[i18n]
    root[root] --> _[.]
    root[root] --> _[.]
    root[root] --> _[.]
    root[root] --> persistence[persistence]
    root[root] --> persistence[persistence]
    root[root] --> utils[utils]
    root[root] --> _vitejs[@vitejs]
    root[root] --> react[react]
    root[root] --> react_dom[react-dom]
```

## Internal Dependencies

Dependencies within this module:

- `vite`

## External Dependencies

Dependencies from other modules:

- `../data/storage.js`
- `../i18n/index.js`
- `../normalize.js`
- `../src/data/storage.js`
- `./App.jsx`
- `./components/HelpPanel.jsx`
- `./components/ProjectDashboard.jsx`
- `./components/ProjectWorkspace.jsx`
- `./components/SettingsPanel.jsx`
- `./components/TemplateManager.jsx`
- `./hooks/useProjects.js`
- `./hooks/useStorageHydration.js`
- `./hooks/useTemplates.js`
- `./i18n/index.js`
- `./index.css`
- `./migrate.js`
- `./normalize.js`
- `./persistence/indexedDb.js`
- `./persistence/opfs.js`
- `./utils/print.js`
- `@vitejs/plugin-react`
- `react`
- `react-dom/client`

