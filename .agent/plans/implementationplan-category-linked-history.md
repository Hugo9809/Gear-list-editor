# Link Saved Gear List Items to Categories

Saved items in the autocomplete history (`HistoryEntry`) currently store only `name`, `unit`, `details`, and `lastUsed`. This change adds a `categoryName` field so items are linked to the category where they were created.

## User Review Required

> [!IMPORTANT]
> This is a **non-breaking, additive change**. Existing history entries will simply have `categoryName` as `undefined` or empty, and the application will continue to work.

**Design decision:** We store `categoryName` (string) instead of `categoryId` (UUID) because:
1. Category IDs change when items are copied/templated.
2. The autocomplete should suggest "Camera body" for any "Camera" category regardless of project.
3. Category names are user-meaningful; IDs are not.

---

## Proposed Changes

### Types & Normalization

#### [MODIFY] [types.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/types.js)
- Add `categoryName` field to `HistoryEntry` typedef (line 56-61)

#### [MODIFY] [normalize.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/data/normalize.js)
- Update `normalizeHistory` (lines 148-161) to include `categoryName` in the entry mapping

---

### Hooks (Remembering Items)

#### [MODIFY] [useProjects.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/shared/hooks/useProjects.js)
- Update `rememberItem` signature: `(item, categoryName)` → store `categoryName`
- Update all call sites of `rememberItem`:
  - `addItemToCategory` (line 217): pass category name from the resolved category
  - `updateItemField` (line 256): pass category name
  - `applySuggestionToItem` (line 333): pass category name

#### [MODIFY] [useTemplates.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/shared/hooks/useTemplates.js)
- Update `applyTemplateToProject` (line 83): pass `category.name` when calling `rememberItem`

---

### Migration (Derive History from Projects)

#### [MODIFY] [migrate.js](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/src/data/migrate.js)
- Update `deriveHistoryFromProjects` usage in `normalizeHistory` to include `categoryName` from the parent category

---

## Verification Plan

### Automated Tests

Existing test file: `app/src/shared/hooks/useProjects.test.jsx`

1. **Add a test** that verifies `rememberItem` stores `categoryName`:

   ```bash
   cd /Users/lucazanner/Documents/GitHub/PDF\ Tool/Gear-list-editor/app
   npm test -- --run src/shared/hooks/useProjects.test.jsx
   ```

   New test case:
   - Create project → add category "Audio" → add item "Wireless Mic"
   - Verify `history.items` contains entry with `name: "Wireless Mic"` and `categoryName: "Audio"`

### Manual Verification

1. Open `http://localhost:5173`
2. Create a new project
3. Add a category named **"Lighting"**
4. Add an item like **"LED Panel"** to that category
5. Open DevTools → Application → IndexedDB → `gear-list-editor-db` → locate the state
6. Verify `history.items` contains an entry with `categoryName: "Lighting"`

