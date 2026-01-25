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
- [x] Update `ProjectDashboard.jsx` to handle archived view (conditional rendering).
- [x] Update `ProjectDashboardContainer.jsx` to pass necessary props.
- [x] Add "Archived Projects" link to sidebar in `Layout.jsx`.
- [ ] Visual Verification (Browser Check).
