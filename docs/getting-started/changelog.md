# Changelog

Recent changes to the Primitive platform libraries.

<!-- CHANGELOG:START - Auto-updated by CI. New entries go below this line. -->

## js-bao-wss v1.3.0 — 2026-04-13

- **Boolean gate conditions** — substitution variables (`$database.metadata.*`, `$params.*`, `$steps.*`) can now appear directly as elements in `$and`/`$or` filter arrays; `false`/`null` short-circuits the branch to no-match without hitting the database, enabling safe server-side feature flags
- **Operation timing instrumentation** — pass `timing: true` to `executeOperation` to get per-phase millisecond breakdowns (`celEvaluation`, `doInvocation`, etc.) in `result._timing`
- **CEL `now()` in trigger expressions** — trigger `set` values are now CEL expressions; use `now()` instead of the old `$now` token
- **Param-level access control** — individual operation parameters can declare their own `access` CEL expression, evaluated against the caller-supplied `value`
- **Critical fix: server sync delay** — `syncComplete` now sent after `syncStep2`, resolving a 10-second first-open delay
- **Critical fix: Safari IDB performance** — IDB connections closed on `pagehide`, zombie transactions aborted on timeout, fixing 1.5–16s page load delays on Safari

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
