# Implementation Plan - Fix Deployment 404s

## Problem
Deployed site at `https://hugo9809.github.io/Gear-list-editor/` returns 404 for all icon files.
`lockdown-install.js` error also reported (likely browser extension related).

## Root Cause
1. The `icons` directory was missing from the repository root (the deployment source).
2. The `index.html` in root was stale/outdated.

## Proposed Changes
1. **Source Code**: Update `app/index.html` to use relative paths for icons (cleaner).
2. **Build**: Run `npm run build:root` to populate the repo root with fresh assets.
3. **Verification**: Check if `icons` folder appears.

## Verification Strategy
- [x] `list_dir` on root to confirm `icons` exists.
- [x] `git status` to confirm `icons` is tracked/available to commit.
- [ ] User to commit and push, then verify on live site (Manual).
