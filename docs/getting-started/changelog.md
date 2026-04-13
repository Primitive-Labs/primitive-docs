# Changelog

Recent changes to the Primitive platform libraries.

<!-- CHANGELOG:START - Auto-updated by CI. New entries go below this line. -->

## js-bao v0.3.1 — 2026-04-13

- Added `filter`, `sort`, and `limit` options to `aggregate()` for filtering records before grouping, sorting aggregation results, and capping the number of groups returned.
- Added StringSet facet aggregation: passing a `stringset` field as a `groupBy` key now counts occurrences per tag value, returning a `{ tagValue: count }` object.
- Added TOML schema loader (`loadSchemaFromTomlString`, `loadSchemaFromToml`) for defining model schemas in TOML files.
- Added YDoc introspection utilities (`discoverSchema`, `discoverModelNames`, `schemaToToml`, `dumpYDocToPlain`, `summarizePlainYDoc`) for server-side schema discovery and document inspection.

## primitive-app v2.1.7 — 2026-04-13

- Dev tools overlay tabs are ordered: Document Explorer, Test Harness, Blob Explorer (icon bar, top to bottom)
- `primitiveDevTools` Vite plugin supports a `keyboardShortcut` option (e.g. `"cmd+shift+l"`) to toggle the overlay without clicking the floating button
- Test harness runs each test in an isolated local-only document (`ctx.docId`), automatically set as the default for all model operations; documents are evicted (no server round-trip) after each test
- Browser console globals (`window.__primitiveAppClient`, `window.__primitiveAppModels`) are exposed on localhost only for interactive debugging

<!-- CHANGELOG:END -->
