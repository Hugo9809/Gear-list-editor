# Walkthrough - Verify Project Delete Feature

## Goal
Verify that the user can delete a project from both the Dashboard and the Project Workspace, with confirmation.

## Steps

1.  **Start Server**: Ensure the app is running on port 5173.
2.  **Dashboard Deletion**:
    *   Create a new project ("Delete Test 1").
    *   Verify it appears in the list.
    *   Click "Delete" button.
    *   Verify button changes to "Confirm?".
    *   Click "Confirm?".
    *   Verify project is removed from the list.
3.  **Workspace Deletion**:
    *   Create a new project ("Delete Test 2").
    *   Open the project.
    *   Locate "Delete" button in the header.
    *   Click "Delete".
    *   Verify button changes to "Confirm?".
    *   Click "Confirm?".
    *   Verify redirection to Dashboard.
    *   Verify "Delete Test 2" is not in the list.

## Verification Evidence
- [ ] Browser recording of the flow.
