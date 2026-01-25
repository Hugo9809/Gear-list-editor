# Implementation Plan - Add Archive Projects Functionality

The user has identified a missing link to "archived projects". Currently, the "Archive" button on the dashboard performs a deletion (removal from state), effectively hiding the project without a dedicated "Archived" view to restore it. This plan introduces a true "Soft Delete" / Archive workflow.

## User Review Required

> [!IMPORTANT]
> The current "Archive" button actually deletes the project from the active list. We will change this behavior to *hide* it from the main dashboard and move it to a new "Archived Projects" view, where it can be "Restored" or "Permanently Deleted".

## Proposed Changes

1.  **Data Model Update**
    -   Update `Project` type to include optional `archived: boolean` property.

2.  **State Management (`useProjects.js`)**
    -   Modify `addProject` to initialize `archived: false`.
    -   Add/Rename `archiveProject` function to toggle `archived: true`.
    -   Add `restoreProject` function (or reuse toggle) to set `archived: false`.
    -   Add `deleteProjectPermanently` to actually remove it from state.

3.  **Navigation & Routing (`App.jsx`, `Layout.jsx`)**
    -   Add a new route `/archived` pointing to a new `ArchivedProjects` component.
    -   Add "Archived Projects" link to the Sidebar in `Layout.jsx` under the 'Projects' section.

4.  **UI Components**
    -   **`ProjectDashboard.jsx`**: Filter `projects` to only show `!p.archived`.
    -   **`ArchivedProjects.jsx`**: Create a new component (copy of Dashboard list style) that shows ONLY `p.archived` projects.
        -   Actions: "Restore", "Delete Permanently".

## Verification Strategy

### Automated Tests
-   **`useProjects.test.js`** (new or update):
    -   Test `archiveProject` sets flag.
    -   Test `restoreProject` unsets flag.
    -   Test `deleteProjectPermanently` removes it.

### Manual Verification
1.  Create a new project "To Archive".
2.  Click "Archive". Verify it disappears from "All Projects".
3.  Click "Archived Projects" in sidebar. Verify it appears there.
4.  Click "Restore". Verify it returns to "All Projects".
5.  Archive it again, then click "Delete" (if implemented). Verify it is gone forever.
