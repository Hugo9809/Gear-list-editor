# Deep Linking Implementation Plan

## Goal
Decouple the "Active Project" state from React state (`useState`) and move it to the URL (`/project/:projectId`). This enables:
1.  **Shareability**: Users can bookmark specific projects.
2.  **Robustness**: Reloading the page on a project keeps you on that project naturally.
3.  **Simplicity**: usage of standard browser navigation (Back/Forward) works out of the box.

## Proposed Changes

### 1. `src/App.jsx`
-   Define a new route: `<Route path="project/:projectId" element={<ProjectWorkspace ... />} />`.
-   Keep `<Route path="project" ... />` as a redirect or empty state.

### 2. `src/shared/hooks/useProjects.js`
-   **Remove**: `activeProjectId` and `setActiveProjectId` from the returned object.
-   **Modify**: `useProjects` will no longer manage "which project is active". It will simply provide the list of projects and methods to update them.
-   The *consumer* (Component) will determine which project is active based on the URL.

### 3. `src/features/projects/ProjectWorkspace.jsx`
-   Use `useParams()` to get `projectId`.
-   Pass `projectId` into `useProjects` or select the project from the list inside the component.

### 4. `src/features/projects/ProjectDashboard.jsx`
-   Change the `onClick` handler for opening a project to a simple `navigate('/project/' + id)`.

## Verification Plan

### Automated Tests
-   Update `useProjects` tests (if any) to reflect API changes.

### Manual Verification
1.  Open Dashboard.
2.  Click a project. Ensure URL changes to `/project/123`.
3.  Reload page. Ensure project 123 is still loaded.
4.  Click Back. Ensure we go back to Dashboard.
