# Walkthrough - Increase PDF Export Padding

I have updated the PDF generation logic to increase the page margins (padding) for exported PDF files.

## Changes

### `app/src/data/pdf/buildDocDefinition.js`

- **Increased Page Margins**: Updated `pageMargins` from `[40, 40, 40, 60]` to `[60, 60, 60, 80]` (Left, Top, Right, Bottom).
- **Narrowed Content Width**: Reduced `PAGE_LINE_WIDTH` from `515` to `475` to accommodate the larger side margins (Original: 515 + 40 + 40 = 595. New: 475 + 60 + 60 = 595).
- **Aligned Footer**: Updated the footer margin to `[60, 20, 60, 0]` to align with the new page text block.

## Verification Results

### Automated Checks
- Verified that the "Export PDF" button remains clickable and triggers the generation process without crashing the application logic.
- Confirmed that the `buildDocDefinition.js` file is syntactically correct and the margin arrays are properly formatted.

### Manual Verification
- Opened the project in the browser.
- Clicked "Export PDF".
- Observed "PDF wird erstellt..." indicating successful initiation of the generation pipeline.
