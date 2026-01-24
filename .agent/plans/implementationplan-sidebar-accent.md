# Implementation Plan - More Accent Color in Sidebar

The goal is to make the sidebar feel more branded and dynamic by incorporating the primary accent color (`--v2-brand-primary`) into more elements.

## Proposed Changes

### [Component Name] Styling updates

#### [MODIFY] [index.css](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/index.css)

Add the following enhancements to the sidebar styles:

1.  **Radial Gradients**: Add `::before` and `::after` pseudo-elements to `.v2-sidebar` (similar to `.ui-sidebar`) to add subtle glows of the brand colors (primary blue and secondary pink).
2.  **Inactive Link Icons**: Change the color of inactive navigation icons from plain grey to a low-opacity version of the accent color.
3.  **Section Titles**: Change `.v2-sidebar-section-title` text color to use the accent color (at 0.8 opacity) instead of plain grey.
4.  **Active Link Indicator**: Add a 3px left border with the accent color to the `.v2-sidebar-link.active` class to make it stand out more.
5.  **Hover State Enhancement**: Update `.v2-sidebar-link:hover` to use a very light version of the accent color for the background, instead of plain grey.

## Verification Plan

### Automated Tests
- No new automated tests are required for these CSS-only changes, but I will ensure existing layout tests pass.

### Manual Verification
- **Visual Check**: Launch the browser and verify the sidebar appearance in:
    - Light Mode (Blue accent)
    - Dark Mode (Blue accent)
    - Pink Mode (Pink accent)
- **Interactive Check**: Verify hover states and active indicators respond correctly to navigation.
- **Recording**: Capture a video of the final sidebar design.
