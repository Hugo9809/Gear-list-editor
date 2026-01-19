# Task: Link Saved Gear List Items to Categories

## Progress

- [/] Planning
  - [x] Analyze existing `HistoryEntry` structure
  - [x] Identify all `rememberItem` call sites
  - [x] Write implementation plan
  - [ ] Get user approval

- [ ] Execution
  - [ ] Update `HistoryEntry` typedef in `types.js`
  - [ ] Update `normalizeHistory` in `normalize.js`
  - [ ] Update `rememberItem` function signature in `useProjects.js`
  - [ ] Update call sites in `useProjects.js`
  - [ ] Update call site in `useTemplates.js`
  - [ ] Update `deriveHistoryFromProjects` in `migrate.js`

- [ ] Verification
  - [ ] Add unit test for `rememberItem` storing `categoryName`
  - [ ] Run `npm test`
  - [ ] Manual verification in browser
