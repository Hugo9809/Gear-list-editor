# Task: Fix PDF Export Font Error

## Status
- [x] Analyze error logs (`File 'Ubuntu-Bold.ttf' not found in virtual file system`)
- [x] Investigate `pdfMake` module structure in Vite/Main thread context
- [x] Apply fix to `pdf.worker.js` (assign `ubuntuVfs` to `pdfMake.virtualfs.storage`)
- [x] Apply fix to `pdfExportService.js` (fallback)
- [ ] Verify PDF export works in browser

## Context
The user reported an error where PDF export fails both in the worker and on the main thread with "File not found in virtual file system".
Key findings: `pdfMake` imported via Vite seems to expose a `virtualfs` property where the storage (vfs) must be assigned to `virtualfs.storage` in some contexts, rather than just `pdfMake.vfs`.

## Implementation Details
- Modified `src/data/pdf/worker/pdf.worker.js` to assign VFS to `pdfMake.virtualfs.storage` if `virtualfs` exists.
- Modified `src/data/pdf/pdfExportService.js` to do the same for the main thread fallback.
