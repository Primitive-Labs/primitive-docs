# Changelog

New features, API changes, and important fixes in the Primitive platform libraries.

<!-- CHANGELOG:START - Auto-updated by CI. New entries go below this line. -->

## primitive-app v2.1.7 — 2026-04-28

- Models are now defined in `src/models/models.toml` and generated into TypeScript via `pnpm models:gen` — you no longer write `defineModelSchema()` by hand; the generated `.generated.ts` files produce the attribute interface, class declaration, and model-name constant automatically
- Model classes are now pure data containers (no instance methods or getters); business logic belongs in a controller module in `src/lib/` as free functions — call sites use `isOverdue(task)` instead of `task.isOverdue`
- The `src/models/index.ts` barrel is now also auto-generated and handles `attachAndRegisterModel` registration for all models; always import models from `@/models` so registration runs exactly once
- `pnpm models:gen` replaces `pnpm codegen` for model generation; re-run it after any change to `models.toml`

## js-bao-wss-client v1.4.3 — 2026-04-24

A large cumulative release across invitations, sharing, server-side automation, databases, storage, and CLI. Highlights:

**Invitations and group membership**

- Custom invitation email CTAs — `invitations.create()` (and the deferred branches of `documents.setPermissions({ email })` and `groups.addMember({ email })`) return `invitationId` + `inviteToken`. `invitations.getAcceptToken(id)` retrieves the token for any existing invitation.
- Token-based acceptance — `invitations.accept(inviteToken)` lets an authenticated caller redeem an invitation under a different identity than the email it was sent to. Resolves all linked deferred grants to the caller. `AppInvitation.acceptedByUserId` records the accepting user.
- `groups.addMember` returns a discriminated union — `DirectGroupAdd | DeferredGroupAdd`. Branch on `status: "added" | "already_member" | "pending_signup"`. `"already_member"` replaces the prior `409`. The `"pending_signup"` branch carries `invitationId` + `inviteToken`.
- `groups.removeMember(groupType, groupId, { email })` removes the membership if one exists, or cancels the pending `DeferredGroupAdd` if not — a single call handles both the "already a member" and "pending invite" cases.
- `documents.listPendingInvitations(documentId)` and `groups.listPendingInvitations(groupType, groupId)` return the deferred grants scoped to one resource.
- `groups.listUserMemberships(userId)` results include `name` (joined from `AppGroup`) and optional `description`; orphan rows are skipped. Accepts `{ groupType }` for server-side push-down filtering.
- Member invitations with quota — set `memberInvitationsEnabled: true` on an app to let regular members invite others, capped by `memberInvitationLimit`. Admins and owners are exempt. New `GET /invitations/quota` endpoint.
- Document access requests — Google-Docs-style "request access" flow. A 403 on `documents.get` returns a `canRequestAccess` hint when applicable. Client methods: `documents.requestAccess`, `listAccessRequests`, `approveAccessRequest`, `denyAccessRequest`. Owners receive WS + email notifications.
- Bookmarks — generic bookmark model for organizing references to documents, databases, or any target type. `client.me.bookmarks.add/remove/rename/list` with prefix queries. Documents are auto-bookmarked on creation.
- Email-based document sharing — pass `email` to `client.documents.setPermissions` (or `setGroupPermission`) and the grant resolves automatically when the recipient signs up. Non-members receive an invitation email.
- Invitation acceptance WebSocket event — the `invitation`/`accepted` event fires reliably from the GET document path (previously silently dropped on that branch).

**Collections**

- `DocumentCollection` exposes `collectionType` and `contextId` (both nullable, immutable after create), mirroring `AppGroup.groupType` + `groupId`. Collection rule sets reference `collection.contextId` to express "caller is a member of the group this collection belongs to." Collection rule sets see a dedicated `collection.*` CEL namespace, separate from the `group.*` namespace used by group rule sets.
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
