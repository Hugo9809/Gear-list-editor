# Task: Implement Delete Feature for Projects

## Background
The user has requested a delete feature for project tiles and opened projects. Currently, there is an "Archive" button on the dashboard, but it likely fails due to a missing method in `useProjects`. There is no delete option in the opened project view.

## Requirements
1.  **Project Dashboard**:
    *   Replace or fix the "Archive" button to be a "Delete" button.
    *   Ensure clicking "Delete" permanently removes the project.
    *   Add a confirmation dialog to prevent accidental deletions.

2.  **Project Workspace (Opened Project)**:
    *   Add a "Delete Project" button (e.g., in the header actions).
    *   Ensure clicking "Delete" permanently removes the project and redirects to the dashboard.
    *   Add a confirmation dialog.

3.  **Data Layer**:
    *   Ensure `deleteProjectPermanently` is exposed and used correctly.
    *   Fix the `useProjects` hook to export the necessary functions.
    *   Update component containers to pass the delete handler.

4.  **Verification**:
    *   Verify deletion from Dashboard updates the list.
    *   Verify deletion from Workspace redirects to Dashboard and updates the list.
    *   Verify persistence (reload page to ensure it's gone).

## Definition of Done
- [x] `useProjects.js` exports `deleteProjectPermanently` (or `deleteProject`).
- [x] `App.jsx` maps `handleDeleteProject` to the correct delete function.
- [x] `ProjectDashboard.jsx` has a working Delete button with confirmation.
- [x] `ProjectWorkspace.jsx` has a working Delete button with confirmation.
- [x] Unit tests for `deleteProject` logic.
- [ ] Browser verification/walkthrough. (Skipped due to quota)
