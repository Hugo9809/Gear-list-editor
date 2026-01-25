# Walkthrough - Pink Lines in PDF

The user requested that the separator lines in the PDF export be colored pink when the application is in "Pink Mode".

## Changes

### 1. PDF Generation Logic
I updated `app/src/data/pdf/buildDocDefinition.js` to dynamically select the line color.

- **Before**: `LINE_COLOR` was hardcoded to `#9CA3AF`.
- **After**: `lineColor` is determined by the theme:
  - Pink Mode: `#F06292` (Matching the subtitle pink accent)
  - Other Modes: `#9CA3AF` (Standard Grey)

### 2. HTML Print Fallback
I updated `app/src/shared/utils/print.js` to mirror this logic, ensuring that if the raw HTML print is used (e.g. on mobile fallback), the lines are also pink.

### 3. Verification
I enhanced the unit test `app/src/data/pdf/buildDocDefinition.test.js` to verify:
1. Pink header accent is present.
2. Pink line color (`#F06292`) is present in the output definition.

## Evidence

### Test Results
```bash
> gear-list-editor@0.1.0 test
> vitest run src/data/pdf/buildDocDefinition.test.js

 ✓ src/data/pdf/buildDocDefinition.test.js (4 tests)
   ✓ buildDocDefinition (4)                        
     ✓ should use pink accent and lines in pink mode
```
