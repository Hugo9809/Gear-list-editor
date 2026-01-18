# Task: Deep Linking Implementation

- [x] Update Routing Configuration
    - [x] Modify `src/app/Layout.jsx` or `src/App.jsx` to define `/project/:projectId` route.
    - [x] Ensure backward compatibility for `/project` (redirect to last active or Dashboard).
- [x] Refactor `useProjects` Hook
    - [x] Remove `activeProjectId` state.
    - [x] Accept `projectId` from URL (via `useParams` in the component, or passing it in).
    - [x] Update `activeProject` derivation to use the ID from the URL.
- [x] Update Components
    - [x] `ProjectDashboard`: Update "Open" buttons to `Link` to `/project/:id`.
    - [x] `ProjectWorkspace`: Ensure it reads ID from URL.
    - [x] `App.jsx`: Clean up old state management.
- [ ] Verification
    - [ ] Unit test: Verify `useProjects` works with ID.
    - [ ] Browser test: Navigate to `/project/123`, reload, ensure correct project loads.
