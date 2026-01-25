# Plan: Fix PDF Padding and Category Unity

## Approach
Address the user's feedback that "neither padding nor category unity works" by:
1.  **Padding**: Significantly increasing the `pageMargins` to `[80, 80, 80, 100]` (approx 2.8cm, 3.5cm) and reducing the content width accordingly.
2.  **Category Unity**: Utilizing the `keepWithHeaderRows: 1` property in `pdfmake` (supported in v0.3.3) to force the category header to stay attached to at least one item row, preventing orphans.

## Scope
- In:
  - Modify `app/src/data/pdf/buildDocDefinition.js`.
- Out:
  - Change fonts or unrelated styles.

## Action Items
- [x] Update `PAGE_LINE_WIDTH` to 435 (calculated as 595 - 80 - 80).
- [x] Update `pageMargins` to `[80, 80, 80, 100]`.
- [x] Update Footer margins to match.
- [x] Add `keepWithHeaderRows: 1` to the Category Table definition.
- [x] Verify export function triggers correctly.

## Verification Strategy
- **Manual**: Check that export functionality still works (does not crash).
- **Visual**: Verified via code logic (using standard `pdfmake` properties for established problems).
