# Changelog

New features, API changes, and important fixes in the Primitive platform libraries.

<!-- CHANGELOG:START - Auto-updated by CI. New entries go below this line. -->

## js-bao-wss v1.0.0 — 2026-04-24

- You can now build custom invitation email CTAs: `invitations.create()` (and deferred group/document branches) return `invitationId` + `inviteToken`, and a new `invitations.getAcceptToken(id)` method lets you retrieve the token for any existing invitation.
- Authenticated users can accept an invitation by token via `invitations.accept(inviteToken)`, resolving all pending deferred grants to their account — even when the signup email differs from the invited email.
- `groups.listUserMemberships(userId, { groupType })` now accepts an optional `groupType` filter for server-side push-down (no post-query filtering needed).
- `databases.list({ databaseType })` now accepts an optional `databaseType` filter to narrow results to a single database type.
- `DocumentCollection` gains `collectionType` and `contextId` fields. Set `contextId` at create time to tie a collection to an external entity (class, project, etc.); CEL collection rules can then reference `collection.contextId` (e.g. `isMemberOf('class', collection.contextId)`).
- `groups.removeMember({ email })` now also cancels any pending deferred invitation for that email when no direct membership exists — a single call handles both the "already a member" and "pending" cases.
- `groups.listUserMemberships()` results now include a `name` field (and optional `description`) for each group, joined at query time.

## Latest (unreleased)

Covers the current `js-bao-wss` server and `js-bao-wss-client` changes that will ship in the next release. A large set of changes across sharing, server-side automation, and storage:

**Sharing and invitations**

- Email-based document sharing — pass `email` to `client.documents.setPermissions` (or `setGroupPermission`) and the grant resolves automatically when the recipient signs up. Non-members receive an invitation email.
- Email-based group membership — `groups.addMember` now accepts `email` in addition to `userId`. Pending adds resolve at signup.
- Member invitations with quota — set `memberInvitationsEnabled: true` on an app to let regular members invite others, capped by `memberInvitationLimit`. Admins and owners are exempt from the quota. New `GET /invitations/quota` endpoint.
- Document access requests — Google Docs-style "request access" flow. A 403 on `documents.get` now returns a `canRequestAccess` hint. New client methods: `documents.requestAccess`, `listAccessRequests`, `approveAccessRequest`, `denyAccessRequest`. Owners receive WS + email notifications.
- Bookmarks — new generic bookmark model for organizing references to documents, databases, or any target type. `client.me.bookmarks.add/remove/rename/list` with prefix queries. Documents are auto-bookmarked on creation.
- Invitation acceptance WebSocket event — the `invitation`/`accepted` event now fires reliably from the GET document path (previously silently dropped on that branch).

**Server-side automation**

- Real-time database subscriptions — `db.subscribe` / `db.unsubscribe` over WebSocket. Server-side subscriptions use parameterized CEL filters to broadcast `db.change` frames to matching connections. Mutations (including those from workflows) automatically trigger subscriptions. Writer's connection is excluded.
- Cron-triggered workflows — new `CronTrigger` model and CLI (`primitive cron-triggers …`). IANA timezone support, overlap skip policy, per-app cap of 50.
- `applyToQuery` database operation — server-side query+mutate in one request with safe-looping truncation signal.
- `analytics.query` workflow step — all 16 analytics query types available from workflows. Default deny, admin/owner bypass, per-run cap of 50.
- Custom email template types — register templates with arbitrary kebab-case names (e.g. `"order-confirmation"`) via admin API, CLI, or web-admin.
- Inline email mode — the `email.send` workflow step can now specify `subject`/`htmlBody`/`textBody` directly in the step config, bypassing templates.
- Workflow run steps endpoint — new app-level API exposes persisted step-level data for debugging.

**Databases**

- `executeBatch` operation type — apply many individual writes in a single request with CEL access checked per-item.
- Database group permissions — new `DatabaseGroupPermission` model. `databases.get()` resolves group access; `databases.list()` stays direct-only (matches document semantics). New `collections.listAll()` admin method to retrieve the full-app view.

**Deprecations**

- `importBulk` operation type is deprecated. Rename existing configs to `executeBatch` and review per-item access rules — the new operation type enforces CEL per item rather than across the whole batch.

**Storage**

- General-purpose blob buckets — new `BlobBucket` model for non-document blob storage. Bucket-based storage with TTL tiers, signed URLs, optional CEL access rules, R2-only tracking, full CLI + sync. New `blob` workflow step.

**CLI**

- Project-scoped config with named environments — `.primitive/config.json` lives in your project. New `primitive env` commands (`create`, `use`, `list`, `delete`, `rename`) for dev/staging/prod environments.
- Test user sign-in — `+primitive` OTP bypass for automated testing, issues 30-minute tokens. Env-gated, admin-role boundaries, invitation-check hardened.

**Fixes and performance**

- `collections.list()` returns only direct-access collections (admin `listAll()` preserves full-app view).
- `primitive apps list` / `primitive use` no longer silently truncate at 25 apps.
- WebSocket fanout pagination — removes the ~100-subscriber silent ceiling; adds bounded parallel fanout.

See [Sharing and Invitations](./sharing-and-invitations.md), [Scheduled and Real-Time Automation](./scheduled-and-realtime-automation.md), and [Blob Buckets](./blob-buckets.md) for full walkthroughs.

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
