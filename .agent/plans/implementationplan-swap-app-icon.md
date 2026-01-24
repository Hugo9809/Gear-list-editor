# Implementation Plan - Swap App Icon

Swap the application icon with the new user-provided image across all PWA and mobile touch locations.

## Proposed Changes

### [Component Name] app/public

#### [MODIFY] [apple-touch-icon.png](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/public/apple-touch-icon.png)
Replace with 180x180 version of the new icon.

#### [MODIFY] [pwa-192x192.png](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/public/pwa-192x192.png)
Replace with 192x192 version of the new icon.

#### [MODIFY] [pwa-512x512.png](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/public/pwa-512x512.png)
Replace with 512x512 version of the new icon (or original if it's large enough).

#### [MODIFY] [app-icon.png](file:///Users/lucazanner/Documents/GitHub/PDF%20Tool/Gear-list-editor/app/public/app-icon.png)
Replace with new icon.

## Verification Plan

### Manual Verification
1. Launch the development server.
2. Verify the favicon in the browser tab.
3. Use the browser to inspect the application manifest and verify the PWA icons.
4. Provide screenshots showing the new icon in the UI if applicable.
