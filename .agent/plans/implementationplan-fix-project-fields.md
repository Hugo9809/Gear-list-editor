# Fix Project Fields Persistence and PDF Export Sync

The new project fields ("Resolution", "Aspect Ratio", "Codec", "Framerate") are currently not being persisted to the database because they are missing from the `normalizeProject` function in `normalize.js`. Additionally, these fields need to be synchronized with the PDF export by adding their translation keys to the PDF export service and the i18n files.

## Proposed Changes

### Data & Persistence

#### [MODIFY] [normalize.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/data/normalize.js)
- Update `normalizeProject` to include `resolution`, `aspectRatio`, `codec`, and `framerate`.

### PDF Export

#### [MODIFY] [pdfExportService.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/data/pdf/pdfExportService.js)
- Add the new translation keys to the `translations` object passed to the PDF generator.

### Internationalization

#### [MODIFY] [en.json](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/i18n/en.json)
- Add translations for the new fields in `project` and `project.print.labels`.

#### [MODIFY] [de.json](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/i18n/de.json)
- Add translations for the new fields in `project` and `project.print.labels`.

---

## Verification Plan

### Automated Tests
- I will run the existing project tests to ensure no regressions.

### Manual Verification
1. Open the Gear List Editor in the browser.
2. Create or edit a project and fill in "Resolution", "Aspect Ratio", "Codec", and "Framerate".
3. Reload the page and verify the data is still there.
4. Export the project to PDF and verify the fields appear in the exported document.
