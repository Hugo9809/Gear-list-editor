# Consolidate Active Project Actions

The user wants to remove duplicate actions and the redundant "Active project" summary tile in the `ProjectWorkspace` view. Currently, there is a main header with "Export PDF" and an inner tile with "Export Project", "Export PDF", and "Save as Template". We will consolidate these into the main header and remove the inner tile.

## User Review Required
> [!NOTE]
> I am moving "Export Project" and "Save as Template" to the top header. "Export PDF" will remain a primary button. "Save as template" will be added as an outline button to avoid visual clutter, unless preferred otherwise.

## Proposed Changes

### Projects Feature

#### [MODIFY] [ProjectWorkspace.jsx](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/features/projects/ProjectWorkspace.jsx)
- Update the top header actions (lines 53-60) to include:
    - `Back to dashboard` (Existing)
    - `Export project` (Moved from inner tile)
    - `Save as template` (Moved from inner tile)
    - `Export PDF` (Existing)
- Remove the inner "Active project" summary tile (lines 65-92).

## Verification Plan

### Manual Verification
- Start the server (`npm run dev`) if not running.
- Open the application in the browser.
- Select a project to enter the workspace.
- **Check**: Verify the "Active project workspace" header contains all 4 buttons.
- **Check**: Verify the inner "Active project" tile is gone.
- **Check**: Verify functionality of the buttons (clicking them doesn't crash, though I won't fully test export logic if not requested, just presence).
