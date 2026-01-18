# Gear-list-editor

This repository now contains a Vite + React + Tailwind CSS app inside the `app/` folder.

## Getting started

1. Install dependencies inside `app/`:

   ```bash
   cd app
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

The Vite dev server requires Node.js because it uses the Vite tooling chain for module bundling and hot reloads.
If you need a non-Node development strategy, you can serve the built static files (`npm run build` and then host
`app/dist/`) with any simple static file server, but you will still need Node.js for the build step.

## Data safety and offline use

The app keeps all data local, autosaves after every change to IndexedDB, and mirrors redundant backups to the
Origin Private File System (OPFS). Backup export, import, and restore are built in so your data stays protected
even without network access.

## In-app help, documentation, and translations

Open the Help and Documentation views in the app to review offline workflows for saving, sharing, importing,
backing up, and restoring gear lists. All help content is available without external links so teams can stay
offline during production.

User-facing copy is centralized in locale JSON files under `app/src/i18n/` so translations stay aligned with
new features and workflows.
