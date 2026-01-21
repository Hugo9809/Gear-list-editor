# Implementation Plan - Device Library Integration

## Objective
Integrate the Device Library into the Project Workspace to allow users to select items from their global library when building project gear lists.

## Proposed Changes

### 1. Update `useProjects` Hook
- **File**: `app/src/shared/hooks/useProjects.js`
- **Change**: 
    - Accept `deviceLibrary` (or `libraryItems`) as a parameter.
    - Update `itemSuggestions` `useMemo` to combine `history.items` and `deviceLibrary.items`.
    - Ensure unique suggestions (avoid duplicates if an item is in both).

### 2. Update `App.jsx`
- **File**: `app/src/App.jsx`
- **Change**: Pass `deviceLibrary` state into `useProjects` hook.

### 3. Verify `TypeaheadInput`
- **File**: `app/src/shared/components/TypeaheadInput.jsx`
- **Context**: Ensure it handles the combined suggestions correctly (it likely expects an array of objects with `name` property).

### 4. Verification Strategy
- **Automated Tests**: Update or create a test for `useProjects` to verify suggestions include library items.
- **Manual Verification**: 
    - Add item to Device Library.
    - Go to a Project.
    - Type into item name field.
    - Verify library item appears in suggestions.

## Detailed Steps
1. Modify `useProjects.js` to accept `deviceLibrary` and update `itemSuggestions`.
2. Update `App.jsx` to pass the prop.
3. Run tests to ensure no regression.
4. Launch browser to verify UI flow.
