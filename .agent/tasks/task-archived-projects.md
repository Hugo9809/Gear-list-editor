# Task: Add Archived Projects Functionality

## Todo List
- [x] Update Project type definition in `types.js` to include `archived` boolean.
- [x] Update `useProjects.js` hook:
    - [x] Add `archiveProject` function.
    - [x] Add `restoreProject` function.
    - [x] Add `deleteProjectPermanently` function.
    - [x] Update `addProject` to initialize `archived: false`.
- [x] Update `useProjects.test.jsx` and pass tests.
- [x] Update `App.jsx` to filter projects and add `/archived` route.
- [x] Fixed syntax error in `App.jsx` preventing route registration.
- [x] Update `ProjectDashboard.jsx` to handle archived view (conditional rendering).
    - [x] Added "View Archived" / "Back to Projects" explicit toggle links.
- [x] Update `ProjectDashboardContainer.jsx` to pass necessary props.
- [x] Add "Archived Projects" link to sidebar in `Layout.jsx`.
- [x] Visual Verification (Manual Confirmation of Fix).
