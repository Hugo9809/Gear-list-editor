# Implementation Plan - Project Delete Feature

## Problem
The user wants to delete projects from the dashboard and the opened project view. Currently, the dashboard has an "Archive" button that attempts to call a non-existent `deleteProject` method, leading to a crash. The opened project view has no delete option.

## Proposed Changes

### 1. Data Layer (`app/src/shared/hooks/useProjects.js`)
- Update `useProjects` return value to expose `deleteProject` (aliasing `deleteProjectPermanently`).
- Ensure `deleteProjectPermanently` correctly removes the project from state.

### 2. Dashboard UI (`app/src/features/projects/ProjectDashboard.jsx`)
- Rename "Archive" button to "Delete".
- Implement a 2-step confirmation for deletion:
    - User clicks "Delete" -> Button becomes "Confirm Delete?" (red).
    - User clicks "Confirm Delete?" -> Project is deleted.
    - Click away or wait (optional) -> Reverts state. (For simplicity, click elsewhere or a "Cancel" button nearby).
- Actually, a simple `window.confirm` might be acceptable if styled confirmation is too complex, but per instructions, we want "Rich Aesthetics". I will implement a local state for the button to show "Confirm?".

### 3. Workspace UI (`app/src/features/projects/ProjectWorkspace.jsx`)
- Add a "Delete project" button to the header actions area (next to Export).
- Implement the same 2-step confirmation logic.
- Ensure efficient navigation back to dashboard after deletion using `onBackToDashboard` or `navigate`.

### 4. Integration (`app/src/App.jsx`)
- Ensure `handleDeleteProject` correctly calls `deleteProject`.
- Ensure `handleDeleteProject` navigates to dashboard if the deleted project was active (though logic handles this implicitly often, explicit navigation is safer).

## Verification Strategy

### Automated Tests
- Update `useProjects.test.jsx` to verify `deleteProject` exists and works.
- Verify `App.test.jsx` (if applicable) or component tests if they exist.

### Manual Verification
1.  Open Dashboard.
2.  Create a test project.
3.  Click "Delete" (expect "Confirm?").
4.  Click "Confirm" (expect Project gone).
5.  Create another project. 
6.  Open it.
7.  Click "Delete" in Workspace (expect "Confirm?").
8.  Click "Confirm" (expect Redirect to Dashboard, Project gone).
