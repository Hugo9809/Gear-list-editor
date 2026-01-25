# Fix Infinite Autosave Loop and Data Retention

The application is currently experiencing an infinite autosave loop due to the `lastSaved` timestamp being included in the dependency array of the `useEffect` hook responsible for scheduling autosaves. This causes the app to save, update the timestamp, trigger the effect, and save again endlessly. This behavior can lead to performance issues, potential race conditions with IndexedDB, and data loss during hard refreshes if writes are interrupted or fail due to congestion.

This plan addresses the issue by removing `lastSaved` from the effect dependencies and optimizing the autosave payload.

## User Review Required
**[IMPORTANT]**
This change alters the autosave behavior. It will no longer save continuously in the background but will correctly respond *only* to state changes (projects, inputs, etc.). This resets the "idle" timer mechanism as intended.

## Proposed Changes

### Shared Hooks

#### [MODIFY] app/src/shared/hooks/useStorageHydration.js
- Remove `lastSaved` from the dependency array of the autosave `useEffect`.
- Update the `scheduleAutosave` call to pass `lastSaved` safely (though it's overwritten by `storageService`, passing the current state value is cleaner/safer).
- Ensure `isHydrated` and `showAutoBackups` logic remains intact.

## Verification Plan

### Automated Tests
- **Note:** Since this is a React Hook behavior involving `useEffect` timing and `storageService` integration, standard unit tests might not easily reproduce the "infinite loop" without complex mocking of timers and effect cycles. We will rely on manual verification and console logs.
- Run existing tests to ensure no regressions: `npm test`

### Manual Verification
1. **Verify No Infinite Loop:**
   - Add a temporary `console.log` in `handlersRef.current.onSaved` in `useStorageHydration.js`.
   - Open the browser DevTools console.
   - Observe that "Saved safely..." logs appear *only* when you make a change (e.g., edit a project name), and stop after one save.
   - Verify they do *not* continue endlessly.

2. **Verify Data Retention:**
   - Open a project.
   - Make significant changes (add items, change descriptions).
   - Wait for the "Autosave complete" status (approx 1-2 seconds).
   - Perform a Hard Refresh (cmd+shift+r or via settings).
   - Verify all changes are retained.

3. **Verify Hard Refresh Logic:**
   - Check if data survives the "Hard Refresh" button in Settings specifically (which clears caches).
