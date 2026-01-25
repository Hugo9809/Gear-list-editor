# Plan: Reduce PDF Bottom Padding

## Context
The user confirmed the PDF export is working (likely via print fallback or resilient pdfmake) but stated there is "too much padding on the bottom".

## Comparison
- **Current Settings**:
  - `pdfmake`: `[80, 80, 80, 100]` (Left, Top, Right, Bottom). Bottom is 100pt (~35mm).
  - `print css`: `25mm` (~95px).

- **Target Settings**:
  - `pdfmake`: `[80, 80, 80, 60]`. Eliminate the extra bottom space.
  - `print css`: `20mm`. Match the top/side margins.

## Action Items
- [x] Modify `app/src/data/pdf/buildDocDefinition.js`: Reduce bottom margin to 60.
- [x] Modify `app/src/shared/utils/print.js`: Reduce bottom margin to 20mm.
- [x] Verify export trigger.

## Verification
- **Manual**: User will verify visually.
- **Automated**: Ensure build/export doesn't crash.
