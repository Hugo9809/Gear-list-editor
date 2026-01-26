# Implementation Plan - Drag & Drop + Undo/Redo

## Goal
Improve the Gear List Editor with "Pro-Level" interaction (Drag-and-Drop) and a "Safety Net" (Undo/Redo).

## User Review Required
> [!IMPORTANT]
> This plan involves a significant refactor of `ProjectWorkspace.jsx` to support Drag-and-Drop. I will extract `CategoryList` and `CategoryItem` components to make the code modular.

## Proposed Changes

### Phase 1: Dependencies & Utilities
#### [NEW] [useUndo.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/shared/hooks/useUndo.js)
- Create a generic hook for managing history states (past, present, future).
- Exposes `undo`, `redo`, `canUndo`, `canRedo`.

#### [MODIFY] [useProjects.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/shared/hooks/useProjects.js)
- Wrap the `projects` state with `useUndo`.
- Export `undo`, `redo` controls.
- Add `reorderCategory` and `moveItem` functions to handle drag events.

### Phase 2: Refactoring ProjectWorkspace
To implement Drag-and-Drop cleanly, we must break down the monolithic `ProjectWorkspace.jsx`.

#### [NEW] [CategoryList.jsx](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/features/projects/components/CategoryList.jsx)
- Renders the list of categories.
- Will eventually wrap them in a SortableContext.

#### [NEW] [CategoryItem.jsx](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/features/projects/components/CategoryItem.jsx)
- Renders a single category (Header + Items).
- Will be a Sortable Element.

#### [MODIFY] [ProjectWorkspace.jsx](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/features/projects/ProjectWorkspace.jsx)
- Replace the inline category mapping with `CategoryList`.
- Add Undo/Redo buttons to the toolbar.

### Phase 3: Implementing Drag and Drop
- Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.

#### [MODIFY] [CategoryList.jsx](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/features/projects/components/CategoryList.jsx)
- Add `DndContext` and `SortableContext`.
- Handle `onDragEnd` for reordering categories.

#### [MODIFY] [CategoryItem.jsx](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/features/projects/components/CategoryItem.jsx)
- Add `SortableContext` for items within the category.
- Handle `onDragEnd` (or bubbling up) for reordering items.

## Verification Plan

### Automated Tests
- `npm run test` to ensure existing logic holds.
- (New tests for `useUndo` logic would be ideal).

### Manual Verification
1.  **Undo/Redo**:
    - Change a project name -> Click Undo -> Project name reverts.
    - Delete an item -> Click Undo -> Item reappears.
2.  **Drag and Drop**:
    - Drag "Lighting" category above "Camera".
    - Drag "Lens" item from "Camera" to "Lighting".
    - Drag "Battery" item to reorder within "Lighting".
    - Verify all changes persist after reload (via existing autosave).
