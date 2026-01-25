# Implementation Plan - Fix Missing Translations and Language Switcher Visibility

The user reports that the translation in the top right corner is missing when returning to the app and requires a click to show again. Based on investigation, several translation keys are missing in `de.json`, and some UI elements are hardcoded in English. The "top right corner" likely refers to elements like "View Archived" or "Last Saved" in the Project Dashboard, or the mobile header's app name and buttons.

## Problem Analysis
1.  **Missing Keys in `de.json`**: Several keys used in `Layout.jsx` and `ProjectDashboard.jsx` (e.g., `navigation.sidebar.sections.projects`, `project.actions.viewArchived`) are missing in the German translation, causing them to fall back to English or key names.
2.  **Hardcoded English Labels**: Some `aria-label`s and helper texts are hardcoded in English.
3.  **Potential I18n Initialization Race**: Though `useState` initialization is synchronous, there might be a delay in how `t` updates across the component tree if not handled carefully during hydration.
4.  **Top Right Corner Visibility**: The user mentions "click it once for it to show again". This might refer to the language switcher select box if it appears empty or incorrect until interaction.

## Proposed Changes
1.  **Update `de.json`**: Add all missing keys found in `Layout.jsx` and `ProjectDashboard.jsx`.
2.  **Update `en.json`**: Ensure consistency with the keys used in the code.
3.  **Refactor `Layout.jsx`**:
    *   Use `t()` for all visible labels and `aria-label`s.
    *   Move `navigationSections` into a `useMemo` to ensure it updates correctly when `t` or `locale` changes.
4.  **Refactor `ProjectDashboard.jsx`**:
    *   Use `t()` for "View Archived" and other hardcoded strings.
5.  **Verify I18n Initialization**: Ensure `getInitialLocale` correctly defaults based on browser settings and stored preference.

## Verification Plan
1.  **Automated Tests**:
    *   Add a test case in `App.test.jsx` or a new `i18n.test.js` to verify that `t` returns the correct German string when the locale is set to 'de'.
    *   Verify that missing keys fallback to the default string provided in `t()`.
2.  **Manual Verification**:
    *   Load the app with German browser settings (or 'de' in localStorage).
    *   Check if sidebar headers and "View Archived" are in German.
    *   Refresh the page and ensure the translations are present immediately without clicking.
    *   Check the top right corner specifically for any missing elements.
