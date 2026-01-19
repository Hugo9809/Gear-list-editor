
# PDF Design Improvement Plan

The goal is to update the generated PDF design to match the reference examples found in the repository (e.g., `250211_Equipmentliste_Bozen_Krimi_2025.pdf`). Based on analysis, the target design features a clean, sans-serif look with specific branding (Pink/Magenta accents), a "Camera Spec Block", and a list-based layout.

## User Review Required

> [!IMPORTANT]
> **Design Assumptions**: I am basing the design updates on a description of the reference files (since they are binary). The key features identified are:
> - **Pink/Magenta Accents**: For titles and headers.
> - **Camera Spec Box**: A dedicated box for Camera A specifications.
> - **List Layout**: Cleaner list style with horizontal separators.
>
> Please confirm if "Pink/Magenta" is the correct branding color, or if I should derive it from the project's existing color palette (which currently seems to use Slate/Blue-Greys).

## Proposed Changes

### PDF Generation Logic (`app/src/data/pdf/`)

#### [MODIFY] [buildDocDefinition.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/data/pdf/buildDocDefinition.js)
- **Header**:
    - Align left.
    - Add "Subtitle" support (e.g., episode numbers if available in project data).
- **Colors**: Implement Theme Awareness.
    - **Pink Mode**: Use Pink/Magenta accents `#E10078`.
    - **Default/Dark Mode**: Use "Brightmode Blue" `#001589` (derived from variable `0 21 137`).
    - *Implementation Check*: Pass current `theme` to `buildDocDefinition` and switch color variables dynamically.
- **Metadata**:

    - Update styling to match "Bold Label + Regular Value" list style.
    - Ensure phone numbers are displayed if available.
- **Categories**:
    - Update the table layout to match the "List Style".
    - Remove defaults that make it look like a grid if necessary.
    - **Camera Spec Block**: Add logic to detect "Camera" category or specific items and render a "System Spec" box if needed (or verify if this is data-driven).
        - *Refinement*: Instead of hardcoding "Camera A", I will check if the items have a "group" concept or just render the first item in a special way if it's the "Camera" category.
- **Footer**:
    - Ensure vertical separation and correct font size.

#### [MODIFY] [pdfExportService.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/data/pdf/pdfExportService.js)
- No major changes expected unless data preparation needs adjustment.

### Validation

#### Automated Tests
- Run `npm test` to ensure no regressions in helper functions.
- I will add a unit test for `buildDocDefinition` to verify the structure contains the new styles (checking for `color: '#...'`).

#### Manual Verification
- **Generate PDF**: Use the app to generate a PDF from a sample project.
- **Compare**: Open the generated PDF and compare it visually with `250211_Equipmentliste_Bozen_Krimi_2025.pdf` (using browser inspection or side-by-side if I can get a screenshot).
