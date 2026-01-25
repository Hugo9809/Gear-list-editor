# Implementation Plan - Fix Reordering Arrows

The user reported that reordering arrows in the gear list items do not work. Code analysis revealed that `moveItemUp` and `moveItemDown` functions are missing from the `projectActions` object in `App.jsx`.

## User Review Required

> [!IMPORTANT]
> This is a minimal fix to wire up existing logic. No architectural changes.

- **Gaps**: None.
- **Assumptions**: The logic inside `useProjects` for moving items works correctly (it looks correct: swaps elements in array).

## Proposed Changes

### `app/src/App.jsx`

- Destructure `moveItemUp` and `moveItemDown` from `useProjects`.
- Add `moveItemUp` and `moveItemDown` to `projectActions` object.

## Verification Strategy

### Automated Tests
- No new unit tests needed as this is a wiring fix in the top-level component.
- The logic within `useProjects` is what would need testing if it were broken, but currently it's unreachable.

### Manual Verification
1.  Open the application.
2.  Create a new project (or use existing).
3.  Add a category if none exists.
4.  Add two items to the category (e.g., "Item A", "Item B").
5.  Click the "Down" arrow on "Item A" or "Up" arrow on "Item B".
6.  Verify that the items swap positions.
7.  Check console for any errors.
