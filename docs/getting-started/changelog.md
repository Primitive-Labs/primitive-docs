# Changelog

New features, API changes, and important fixes in the Primitive platform libraries.

<!-- CHANGELOG:START - Auto-updated by CI. New entries go below this line. -->

## js-bao-wss v1.3.0 — 2026-04-13

- You can now use boolean gate conditions in workflow filters — place substitution variables (`$database.metadata.*`, `$params.*`, `$steps.*`) directly in `$and`/`$or` arrays to short-circuit branches without hitting the database
- Pass `timing: true` to `executeOperation` to get per-phase millisecond breakdowns (`celEvaluation`, `doInvocation`, etc.) in `result._timing`
- Trigger `set` values are now CEL expressions — use `now()` instead of the old `$now` token
- Individual operation parameters can declare their own `access` CEL expression for param-level access control
- Fixed a 10-second first-open sync delay and Safari IndexedDB performance issues causing 1.5–16s page load delays

## js-bao v0.3.1 — 2026-04-13

- You can now pass `filter`, `sort`, and `limit` options to `aggregate()` to filter records before grouping, sort results, and cap the number of groups returned
- Aggregating by a `stringset` field now counts occurrences per tag value, returning a `{ tagValue: count }` object
- New TOML schema loaders (`loadSchemaFromTomlString`, `loadSchemaFromToml`) let you define model schemas in TOML files
- New YDoc introspection utilities (`discoverSchema`, `discoverModelNames`, `schemaToToml`, `dumpYDocToPlain`, `summarizePlainYDoc`) for server-side schema discovery and document inspection

## primitive-app v2.1.7 — 2026-04-13

- You can now pass a `keyboardShortcut` option (e.g. `"cmd+shift+l"`) to the `primitiveDevTools` Vite plugin to toggle the dev tools overlay from the keyboard
- Test harness now runs each test in an isolated local-only document, automatically cleaning up after each test
- `window.__primitiveAppClient` and `window.__primitiveAppModels` are exposed on localhost for interactive debugging in the browser console

<!-- CHANGELOG:END -->
