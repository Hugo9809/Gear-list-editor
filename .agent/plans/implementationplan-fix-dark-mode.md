
# Implementation Plan - Dark Mode Revamp

The user has reported that the current dark mode looks "horrible". This is primarily due to poor contrast (dark blue brand colors on dark blue background) and lack of vibrancy.

## Visual Design Strategy (Dark Mode)
- **Backgrounds**: Switch to a refined "Midnight Slate" palette (Slate 950/900/800) for a premium, deep look.
- **Brand Color**: Change from Deep Blue (`#001589`) to **Electric Blue** (`#60a5fa`, Blue-400) to ensure readability and "pop" against dark backgrounds.
- **Typography**: Update text colors to Slate-100/400 sequence for better readability without harsh eye strain.
- **Project Colors**: Brighten all project tag colors to their "pastel neon" variants so they are legible.

## Proposed Changes

### `app/src/index.css`
- Update `:root[data-theme='dark']` block.
- Define new surface colors.
- Define new brand primary colors (Hover/Active states included).
- Updating text and border colors.
- Updating project tag colors.

## Verification
- **Automated**: None (Visual CSS change).
- **Manual**:
  - Launch app.
  - Switch to Dark Mode.
  - Verify Sidebar contrast.
  - Verify Primary Buttons (should be Bright Blue with Dark Text).
  - Verify Links and Headings.
