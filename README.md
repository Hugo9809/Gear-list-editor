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

## GitHub Pages deployment

The GitHub Pages workflow builds the app with `npm run build` and publishes the static output in `app/dist/`.
Because Pages serves this repo under a base path, the build must include `--base=/<repo-name>/` (for example,
`/Gear-list-editor/`). Update the base path if the repository name changes or if you deploy from a fork.

If your Pages site is configured to deploy directly from the `main` branch (root), build the static files into
the repository root with:

```bash
cd app
npm run build:root
```

This creates a root-level `index.html` and `assets/` folder so Pages serves the app instead of the README.

## Data safety and offline use

The app keeps all data local, autosaves after every change to IndexedDB, and mirrors redundant backups to the
Origin Private File System (OPFS). Backup export, import, and restore are built in so your data stays protected
even without network access. Theme preferences (bright, dark, pink-light, pink-dark) are stored locally and
included in offline backups.

## GitHub Pages base path

When building for a repository subpath (such as GitHub Pages), set `VITE_BASE_URL` to `/<repo>/` before running
`npm run build` in `app/`. The default base is `/Gear-list-editor/`, so builds work from that subpath without
additional configuration.
