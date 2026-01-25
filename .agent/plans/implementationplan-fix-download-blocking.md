# Implementation Plan - Fix Download Blocking and Incomplete Files

Addressing the issue where Chrome blocks downloads or results in incomplete files due to premature Blob URL revocation.

## User Review Required

> [!IMPORTANT]
> This fix introduces a 10s delay to Blob URL revocation. This is a standard workaround for browser "incomplete file" errors.

- None

## Proposed Changes

### Logic Updates

#### `App.jsx`
- In `downloadBackup` and `exportProject`:
  - Wrap `URL.revokeObjectURL(url)` in a `setTimeout` with 10s delay.
  - This prevents the browser from invalidating the download source while the download is still initializing.

#### PDF Fonts
- Run `npm run gen:pdf-fonts` to regenerate the Virtual File System (VFS) for PDF generation, as the browser agent detected missing fonts causing export failures.

## Verification Strategy

### Automated Verification
- Use browser agent to trigger "Export Project" and ensure:
  - Download is triggered.
  - No console errors appear.
  - Download completes (by intercepting events/checking logs, as we can't inspect file on disk in this env).
- Manually run `gen:pdf-fonts` and check output.

### Manual Verification
- User should try exporting a project and a backup.
- User should try exporting PDF (now fixed as a side-effect).
