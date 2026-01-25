# Plan: Fix PDF Pagination for Categories

## Approach
Refactor the PDF generation logic in `buildDocDefinition.js` to prevent category headers from being orphaned at the bottom of a page. Detailed approach:
1.  Combine the Category Header (currently separate Canvas/Text elements) and the Items Table into a **single table**.
2.  Make the "Category Name" the first row of this table (Header Row) with `colSpan: 3`.
3.  enable `headerRows: 1` on the table to ensure the header stays with the content (and repeats if necessary, which is standard behavior for preventing orphans).
4.  Adjust margins and layout to match the existing visual design (lines above/below header) within the single-table structure.

## Scope
- In:
  - Modify `app/src/data/pdf/buildDocDefinition.js`
  - Update `categoryContent` generation logic.
- Out:
  - Changing other PDF sections (Camera Spec, Footer, etc).

## Action Items
- [x] Read `app/src/data/pdf/buildDocDefinition.js`.
- [x] Replace `categoryContent` mapping function with new logic that yields a single table per category.
  - Implement Header Row with `colSpan: 3`.
  - Configure `layout` to draw strict horizontal lines matching previous design (Top border, Separator, Bottom border).
  - Set `headerRows: 1`.
- [x] Verify using the Browser Subagent (Generate PDF and ensure no errors; visual verification of pagination is difficult but structural verification is possible).

## Verification Strategy
- **Manual**: Generate a PDF and check console for errors.
- **Visual**: Since I cannot see page breaks easily in the browser view of a PDF (often blob download), I will rely on the code structure guarantee (`headerRows: 1` is the standard fix). I will check that the "Export" button still works.

## Open Questions
- None.
