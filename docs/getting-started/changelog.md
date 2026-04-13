# Changelog

New features, API changes, and important fixes in the Primitive platform libraries.

<!-- CHANGELOG:START - Auto-updated by CI. New entries go below this line. -->

## js-bao v0.3.1 — 2026-04-13

- New `upsertOn` option for `save()` — pass `upsertOn: "fieldName"` to create-or-update a record by a unique field value instead of requiring an explicit ID, with transactional lookup to prevent race conditions
- Schema discovery and TOML utilities (`discoverSchema`, `discoverModelNames`, `schemaToToml`, `loadSchemaFromTomlString`, `loadSchemaFromToml`) are now re-exported from all bundle entry points (browser, node, cloudflare)
- New YDoc dump utilities for debugging: `dumpYDocToPlain()` and `summarizePlainYDoc()` let you inspect document structure as plain JavaScript objects (node bundle)
- Fixed schema discovery failing when YDoc share entries weren't materialized before instanceof checks

## js-bao-wss — 2026-04-10

- Model-less documents — you can now work with Yjs documents without pre-defining TypeScript model classes; the server auto-discovers document schema at runtime
- New `getDocumentSchema()` API and `schema-discovered` event for client-side schema introspection; pass `schemaToml` to `JsBaoClient` for client-side model validation
- Workflow runs triggered via webhooks and `workflow.start` are now visible through the API (previously hidden)
- `upsertOn` support for conditionally creating or updating records based on field values
- Fixed awareness state keying — `sendAwarenessState` and `_broadcastAwareness` now consistently use `connectionId`, preventing duplicate awareness entries
- Fixed HTTP 400 errors when syncing database records with no top-level field changes

## primitive-app v2.1.7 — 2026-04-13

- New `getOrCreateWithAlias()` API replaces the old multi-step document alias flow — handles race conditions server-side, eliminating the need for client-side retry logic
- Fixed passkey credential prompt unexpectedly appearing after OTP sign-in — auth flow now properly cancels pending passkey ceremonies
- New `VITE_APP_NAME` environment variable to customize the browser tab title

<!-- CHANGELOG:END -->
