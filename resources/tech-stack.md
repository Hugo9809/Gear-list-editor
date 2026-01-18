# Preferred Tech Stack & Implementation Rules

When generating code or UI components for this brand, you **MUST** strictly adhere to the following technology choices.

## Core Stack

* **Framework:** React (functional components with hooks).
* **Build Tool:** Vite.
* **Styling:** Tailwind CSS + CSS Variables (CSS Custom Properties).
  * **Note:** Do NOT use SASS/SCSS or CSS-in-JS unless a specific localized module explicitly requires it.
  * **Structure:** Global styles live in `app/src/index.css`; Tailwind configuration lives in `app/tailwind.config.js`.
* **Logic Location:** UI logic stays in `app/src/` with data/persistence utilities in `app/src/data/`.
* **State Management:** React state/hooks + the existing storage service (`app/src/data/storage.js`).
* **Icons:** Use locally stored UI icons/assets already in the repo (no new external icon libraries).

## Implementation Guidelines

### 1. CSS Variables Strategy
* Use CSS variables mapped from the design tokens when defining custom styles.
* Example: Use `var(--v2-brand-blue)` instead of `#001589`.
* Example: Use `var(--v2-space-md)` instead of `16px`.

### 2. Component Patterns
* **Components:** Prefer small, reusable React components.
* **Composition:** Keep data fetching/persistence logic in dedicated utilities; keep presentation components focused on UI.
* **Themes:** Support Light, Dark, and Pink modes by using theme-specific CSS or Tailwind variants as implemented in the app.

### 3. Data Safety & Offline-First
* **Persistence:** All data must be saved through the storage service to maintain IndexedDB + OPFS backups.
* **No Data Loss:** Always preserve user data during changes; never bypass or replace the existing save/restore flows.

### 4. Forbidden Patterns
* Do NOT introduce external UI libraries without approval.
* Do NOT use jQuery.
* Do NOT introduce new heavy dependencies without approval.
