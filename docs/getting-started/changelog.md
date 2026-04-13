# Changelog

Recent changes to the Primitive platform libraries.

<!-- CHANGELOG:START - Auto-updated by CI. New entries go below this line. -->

## primitive-app v2.1.7 — 2026-04-13

- Dev tools overlay tabs are ordered: Document Explorer, Test Harness, Blob Explorer (icon bar, top to bottom)
- `primitiveDevTools` Vite plugin supports a `keyboardShortcut` option (e.g. `"cmd+shift+l"`) to toggle the overlay without clicking the floating button
- Test harness runs each test in an isolated local-only document (`ctx.docId`), automatically set as the default for all model operations; documents are evicted (no server round-trip) after each test
- Browser console globals (`window.__primitiveAppClient`, `window.__primitiveAppModels`) are exposed on localhost only for interactive debugging

<!-- CHANGELOG:END -->
