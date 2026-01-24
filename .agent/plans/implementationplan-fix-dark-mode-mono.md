
# Implementation Plan - Neutral Dark Mode

The user has explicitly requested to remove the "Blue" tint from the dark mode and switch to a "Dark Gray and Black" palette with "White Text".

## Visual Design Strategy (Neutral Mono)
- **Backgrounds**: Remove all Saturation. Switch to `Zinc` / `Neutral` gray scale.
  - App Background: Pure Black (`#000000`) or near-black (`#09090b`).
  - Surfaces: Dark Grays (`#18181b`, `#27272a`).
- **Typography**: High contrast White (`#ffffff`) and Light Gray (`#a1a1aa`).
- **Brand Accent**: Keep the Electric Blue for *interactive elements* only (buttons, focus states) but remove it from surfaces/borders to satisfy "no blue backgrounds".

## Proposed Changes

### `app/src/index.css`
- Update `:root[data-theme='dark']` block.
- Replace `Slate` colors (Blueish Gray) with `Zinc` (Neutral Gray) or manual Dark Grays/Blacks.

## Verification
- **Manual**:
  - Launch app.
  - Switch to Dark Mode.
  - Verify background is Black/Dark Gray (not Navy).
  - Verify text is White.
