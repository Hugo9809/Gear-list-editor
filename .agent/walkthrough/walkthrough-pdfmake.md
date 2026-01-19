# Offline PDF Export (pdfmake)

> Implemented entirely clients-side PDF generation using pdfmake, capable of running offline in PWA and Desktop app.

## Changes

### 1. New Core Services (`app/src/data/pdf/`)
- **`snapshotTypes.js`**: Builds a deterministic JSON snapshot of the project data for export.
- **`buildDocDefinition.js`**: Transforms the snapshot into a `pdfmake` document definition (JSON).
- **`pdfExportService.js`**: Orchestrates the export flow (Snapshot → DocDef → Worker → Blob → Download).

### 2. Web Worker (`app/src/data/pdf/worker/`)
- **`pdf.worker.js`**: Runs `pdfmake` in a background thread to prevent UI freezing during generation.
- Imports `pdfmake` and custom VFS fonts.

### 3. Font System (`app/src/data/pdf/fonts/`)
- **`generate-vfs.mjs`**: Utility script to embed fonts into a JavaScript VFS module.
- **`ubuntu-vfs.js`**: Generated font file (currently empty placeholder, uses Roboto fallback).

### 4. Integration
- updated **`App.jsx`** to replace `window.print()` with `exportPdf()`.
- Added **i18n keys** for export status messages in `en.json` and `de.json`.
- Added **`npm install date-fns pdfmake`**.

## Verification

### Automated Tests
Run `npm test` in `app/` directory:
- `test/unit/snapshotTypes.test.js`: ✅ Validates snapshot schema.
- `test/unit/buildDocDefinition.test.js`: ✅ Generic table structure and metadata.

### Manual Verification
1. Open App (`npm run dev`).
2. Open a project.
3. Click **Export PDF**.
4. Status should change to "Generating PDF..." then "PDF downloaded successfully".
5. Check PDF content:
    - Project Metadata (Client, Date, Contact)
    - Category tables with Items
    - Page numbers in footer
    - Correct formatting

### Offline Test
1. Disconnect network / go offline.
2. Click **Export PDF**.
3. PDF should still generate instanly (all assets bundled).

## Next Steps
- Add **Ubuntu font files** to `app/assets/fonts/ubuntu/` and run `npm run gen:pdf-fonts` to switch from Roboto to Ubuntu.
