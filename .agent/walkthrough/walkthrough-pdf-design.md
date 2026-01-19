
# PDF Design Improvements Walkthrough

I have updated the PDF generation logic to match the "Bozen Krimi" reference design.

## Changes

- **Theme Support**: The PDF now adapts to the app's theme.
    - **Pink Mode**: Uses `#E10078` for headers.
    - **Light/Dark Mode**: Uses `#001589` (Brightmode Blue).
- **Layout**:
    - Project Title is now left-aligned and larger.
    - Metadata is formatted as a grid with bold labels.
    - Categories use a cleaner list style with light horizontal separators.
    - Footer includes page numbers and project name.

## Verification

### Automated Tests
- Created `app/src/data/pdf/buildDocDefinition.test.js`.
- Verified that the correct color codes are injected based on the `theme` parameter.

### Manual Verification Steps
1. Open the app in **Pink Mode**.
2. Go to a project and click "Export PDF".
3. Verify the generated PDF has **Pink** headers.
4. Switch to **Light Mode**.
5. Export PDF again.
6. Verify the headers are **Blue**.
