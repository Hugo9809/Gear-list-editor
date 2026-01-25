# Walkthrough - Fix Deployment 404s

## Steps Taken

1. **Analysis**
   - Discovered that the `icons` folder was missing from the repository root, which serves as the deployment source.
   - Identified that `index.html` in the root was not matching the expected state.

2. **Code Changes**
   - **File**: `app/index.html`
   - **Change**: Removed leading slashes from icon hrefs to make them relative. This ensures they resolve correctly regardless of the base path (Vite injects base path, but relative is safer for assets in `public` that aren't imported in JS).

3. **Build execution**
   - Ran `npm run build:root`.
   - Result: `icons` folder, `index.html`, and other assets were generated in the root directory.

4. **Verification**
   - Checked `git status`: `icons/` folder is now ready to be added.
   - Checked `manifest.webmanifest`: Content is correct.

## Automated Tests
- None required for this config/build fix.

## Manual Verification
- Verified file existence in `public` output.
- User needs to push to GitHub to verify live site fix.
- User should check if `lockdown-install.js` error persists (likely from a browser extension).
