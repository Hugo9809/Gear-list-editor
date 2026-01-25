# Implementation Plan - Contact Deletion Internal Popup

replacing the browser native `window.confirm` with a custom React component for contact deletion confirmation.

## User Review Required

> [!IMPORTANT]
> This is a UI change that aligns with the requested internal popup behavior.

- None

## Proposed Changes

### UI Components

#### [NEW] `ConfirmDialog.jsx`
- Reusable modal component.
- Supports title, message, confirm/cancel actions, and destructive styling.
- **Location**: `app/src/shared/components/ConfirmDialog.jsx`

### Feature Updates

#### `ContactsPage.jsx`
- Import `ConfirmDialog`.
- Add state `contactToDelete` to track the ID of the contact pending deletion.
- Replace `window.confirm` in `handleDelete` with state update.
- Render `ConfirmDialog` conditionally based on state.

## Verification Strategy

### Automated Tests
- None required for this UI interaction change as per current scope, but manual verification is key.

### Manual Verification
- Navigate to `/contacts`.
- Attempt to delete a contact.
- Verify the Custom Modal appears.
- Verify "Cancel" dismisses the modal without deleting.
- Verify "Delete" confirms the action and removes the contact.
