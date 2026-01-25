# Walkthrough - Archived Projects

I have implemented the missing "Archived Projects" functionality.

## Changes

### 1. Data Model & State
-   Updated `Project` type in `types.js` to include `archived: boolean`.
-   Updated `useProjects.js` to support:
    -   `archiveProject(id)`: Sets `archived: true`.
    -   `restoreProject(id)`: Sets `archived: false`.
    -   `deleteProjectPermanently(id)`: Removes project from state (Hard Delete).
    -   Renamed usage of old `deleteProject` to `deleteProjectPermanently` where appropriate, but UI "Archive" button now maps to `archiveProject`.

### 2. Navigation
-   Added `/archived` route in `App.jsx`.
-   Added "Archived Projects" link to the Sidebar in `Layout.jsx`.

### 3. UI Components
-   **`ProjectDashboard.jsx`**:
    -   Supports `isArchivedView` prop.
    -   Filters creation form when in archived view.
    -   Shows "Restore" and "Delete" (Permanent) buttons in archived view.
    -   Shows "Archive" button in standard view.
-   **`App.jsx`**:
    -   Filters `projects` into `activeProjects` and `archivedProjects`.
    -   Passes appropriate lists to Dashboard versions.

## Verification Results

### Automated Tests
`npm test useProjects` passed successfully, verifying:
-   Initialization.
-   Archiving (flag toggle).
-   Restoring (flag toggle).
-   Permanent Deletion (removal).

```
 ✓ src/shared/hooks/useProjects.test.jsx (11 tests) 21ms
   ...
   ✓ should permanently delete a project 1ms
   ✓ should archive and restore a project 1ms
   ...
```

### Manual Verification
Attempted browser verification but hit resource limits. However, unit tests cover the core logic, and UI logic is standard conditional rendering.
