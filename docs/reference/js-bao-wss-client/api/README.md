**js-bao-wss-client**

***

# JsBao Client Library

A TypeScript/JavaScript client library for js-bao-wss that provides HTTP APIs and real-time collaborative editing using Yjs. This README reflects the current implementation and replaces older docs that referenced removed options/behaviors.

## Features

- **Document Management**: Create, list, update, delete via HTTP
- **Permissions**: Get/update/remove document permissions
- **Invitations**: Create/list/update/delete; accept/decline (invitee)
- **Realtime Collaboration**: Y.Doc sync over multi-tenant WebSocket
- **Awareness**: Presence/cursor broadcast and server-triggered refresh
- **Auth/OAuth**: Client-orchestrated OAuth and cookie refresh
- **Magic Link Authentication**: Passwordless email-based sign-in
- **OTP Authentication**: Passwordless sign-in with 6-digit email codes
- **Passkey Authentication**: WebAuthn/passkey support for passwordless sign-in
- **Automatic Reconnect**: Backoff + re-auth on 401
- **Token Management**: Proactive refresh in HTTP calls
- **Analytics**: Buffered event logging API with optional automatic lifecycle events
- **Blob Storage**: Upload/list/get/downloadUrl/delete per document with offline cache
- **LLM**: Chat API and model listing
- **Workflows**: Server-side multi-step processes with LLM, delays, and transformations
- **Workflow Apply**: Single-client claim/confirm flow for applying workflow results to Yjs documents
- **Offline-first Open**: Non-blocking open with IndexedDB-backed cache
- **Offline Blob Cache**: Cache API + IndexedDB backed uploads/reads with eviction and retry
- **Network Controls**: Online/offline modes, reachability, connection control
- **Root Documents**: Opt-in listing via `includeRoot`

## Installation

```bash
npm install js-bao-wss-client

# Peer dependencies
npm install yjs lib0
```

## Node.js Environment

The client works in both browser and Node.js environments. Storage behavior differs by environment:

| Environment | Storage Provider | Persistence | Automatic |
|-------------|-----------------|-------------|-----------|
| Browser | IndexedDB | ✅ Persistent | ✅ Yes |
| Node.js + better-sqlite3 | SQLite | ✅ Persistent | ✅ Yes (if installed) |
| Node.js (no native deps) | Memory | ❌ Volatile | ✅ Fallback |

### Enabling Persistence in Node.js

To enable persistent storage in Node.js, install `better-sqlite3`:

```bash
npm install better-sqlite3
```

The client will automatically detect and use it. Data is stored at `~/.js-bao/{appId}/storage.db`.

### How Auto-Detection Works

```
Browser → Uses IndexedDB (always)
Node.js → Checks for better-sqlite3
  ├─ Found → Uses SQLite file storage
  └─ Not found → Falls back to in-memory with warning
```

### Explicit Configuration

You can override the auto-detection with `storageConfig`:

```typescript
import { initializeClient } from "js-bao-wss-client";

// Force SQLite with custom path
const client = await initializeClient({
  // ... other options
  storageConfig: { type: "better-sqlite3", filePath: "./data/my-app.db" },
});

// Force in-memory (no persistence)
const client = await initializeClient({
  // ... other options
  storageConfig: { type: "memory" },
});
```

### What's Stored

The storage provider persists:
- **KV Cache**: API response caching for offline access
- **Offline Grants**: Credentials for offline authentication
- **Auth Tokens**: JWT persistence across restarts (if `auth.persistJwtInStorage` is enabled)
- **Analytics Queue**: Buffered analytics events
- **Document Metadata**: Last-opened timestamps and local document state

### Browser Bundling

When bundling for browsers, `better-sqlite3` is automatically excluded:
- Dynamic imports ensure the SQLite code is never loaded in browsers
- The browser build uses IndexedDB exclusively
- No configuration needed—tree-shaking handles it automatically

### Yjs Document Persistence

The storage options above (`storageConfig`) handle general data like auth tokens and cache. **Yjs document persistence** (offline document editing) is configured separately:

| Environment | Default Provider | Persistence |
|-------------|-----------------|-------------|
| Browser | y-indexeddb (built-in) | ✅ Automatic |
| Node.js | None | ❌ Server-only sync |

To enable Yjs document persistence in Node.js, use the `yjsPersistence` option with [y-sqlite3](https://www.npmjs.com/package/y-sqlite3):

```bash
npm install y-sqlite3
```

```typescript
import { initializeClient } from "js-bao-wss-client";
import { SqlitePersistence } from "y-sqlite3";

const client = await initializeClient({
  apiUrl: "https://api.example.com",
  wsUrl: "wss://api.example.com",
  appId: "my-app",
  models: [Task, Project],

  // Yjs document persistence for Node.js
  yjsPersistence: (docId, ydoc, { appId, userId }) => {
    return new SqlitePersistence(docId, ydoc, {
      dbPath: `${process.env.HOME}/.my-app/${appId}/${userId}/yjs.sqlite`
    });
  },
});

// Documents now persist locally in SQLite
const { ydoc } = await client.documents.open("doc-123", {
  waitForLoad: "localIfAvailableElseNetwork"
});
```

**Why two storage systems?**

- `storageConfig` → General key-value data (auth, cache, metadata)
- `yjsPersistence` → Yjs document updates (binary CRDT data with specialized compaction)

Browser users don't need to configure either—both use IndexedDB automatically.

### Complete Node.js Example

Here's a complete example for a CLI tool or server application:

```typescript
import { initializeClient } from "js-bao-wss-client";
import { SqlitePersistence } from "y-sqlite3";
import * as path from "path";
import * as os from "os";

// Define your models
import { Task, Project } from "./models";

async function main() {
  const appId = "my-app";
  const dataDir = path.join(os.homedir(), ".my-app", appId);

  const client = await initializeClient({
    apiUrl: "https://api.example.com",
    wsUrl: "wss://api.example.com",
    appId,
    token: process.env.AUTH_TOKEN, // Or use auth flows below
    models: [Task, Project],

    // SQLite for general storage (auth, cache, metadata)
    storageConfig: {
      type: "better-sqlite3",
      filePath: path.join(dataDir, "storage.db"),
    },

    // SQLite for Yjs document persistence
    yjsPersistence: (docId, ydoc, { userId }) => {
      return new SqlitePersistence(docId, ydoc, {
        dbPath: path.join(dataDir, userId, "documents.db"),
      });
    },

    // Persist JWT across restarts
    auth: {
      persistJwtInStorage: true,
      storageKeyPrefix: "cli",
    },

    // Node.js database config
    databaseConfig: {
      type: "node-sqlite",
      options: {},
    },
  });

  // Wait for connection
  await new Promise<void>((resolve) => {
    if (client.isConnected()) return resolve();
    client.on("status", (e) => e.status === "connected" && resolve());
  });

  // Work with documents
  const { doc: ydoc } = await client.documents.open("doc-123", {
    waitForLoad: "localIfAvailableElseNetwork",
    enableNetworkSync: true,
  });

  // Use your models
  const tasks = await Task.query();
  console.log(`Found ${tasks.data.length} tasks`);

  // Clean up
  await client.destroy();
}

main().catch(console.error);
```

### Offline-First in Node.js

The client supports offline-first patterns in Node.js:

```typescript
// Check network status
const status = client.getNetworkStatus();
console.log(`Mode: ${status.mode}, Online: ${status.isOnline}`);

// Force offline mode (for testing or airplane mode)
await client.setNetworkMode("offline");

// Create documents while offline (queued for sync)
const { metadata } = await client.documents.create({
  title: "Offline Draft",
  localOnly: false, // Will sync when back online
});

// Work with local data
const { doc } = await client.documents.open(metadata.documentId, {
  waitForLoad: "local", // Don't wait for network
  enableNetworkSync: false,
});

// Go back online - pending creates auto-sync
await client.setNetworkMode("online");

// Or manually commit pending creates
await client.documents.commitOfflineCreate(metadata.documentId);
```

### JWT Persistence Across Restarts

Enable JWT persistence so CLI tools remember authentication:

```typescript
const client = await initializeClient({
  // ... other options
  storageConfig: {
    type: "better-sqlite3",
    filePath: "./data/storage.db",
  },
  auth: {
    persistJwtInStorage: true,
    storageKeyPrefix: "my-cli", // Namespace for multiple tools
  },
});

// First run: provide token
// Subsequent runs: token is loaded from SQLite automatically

// Check if we have a persisted session
const userId = await client.waitForUserId({ timeoutMs: 5000 }).catch(() => null);
if (userId) {
  console.log(`Restored session for user: ${userId}`);
} else {
  console.log("No saved session, please authenticate");
}
```

### Local-Only Documents (No Server)

Create documents that never sync to the server:

```typescript
// Create local-only document
const { metadata } = await client.documents.create({
  title: "Local Notes",
  localOnly: true,
});

// Open without network
const { doc } = await client.documents.open(metadata.documentId, {
  waitForLoad: "local",
  enableNetworkSync: false,
});

// Data persists in SQLite but never syncs to server
const notes = doc.getMap("notes");
notes.set("idea", "This stays local");

// Clean up local data when done
await client.documents.evict(metadata.documentId, { force: true });
```

### Multi-Client Sync Testing

For testing sync behavior between multiple Node.js clients:

```typescript
import { initializeClient } from "js-bao-wss-client";

async function testSync() {
  // Create two clients (different storage paths)
  const client1 = await initializeClient({
    // ... shared config
    storageConfig: { type: "better-sqlite3", filePath: "./data/client1.db" },
  });

  const client2 = await initializeClient({
    // ... shared config
    storageConfig: { type: "better-sqlite3", filePath: "./data/client2.db" },
  });

  // Both open same document
  const doc1 = await client1.openDocument("shared-doc");
  const doc2 = await client2.openDocument("shared-doc");

  // Changes sync via WebSocket
  doc1.getMap("data").set("from", "client1");

  // Wait for sync
  await new Promise((r) => setTimeout(r, 1000));

  // Verify on client2
  console.log(doc2.getMap("data").get("from")); // "client1"

  await Promise.all([client1.destroy(), client2.destroy()]);
}
```

### Required Packages for Node.js

```bash
# Core (always required)
npm install js-bao-wss-client yjs lib0 js-bao

# For SQLite storage (optional, recommended for persistence)
npm install better-sqlite3

# For Yjs document persistence (optional, for offline document editing)
npm install y-sqlite3
```

Note: `better-sqlite3` and `y-sqlite3` are native modules requiring compilation. If you encounter build issues, ensure you have the appropriate build tools installed (Python, C++ compiler).

## Quick Start

> Migrating from legacy decorators? Follow `src/client/docs/js-bao-v2-migration.md` before continuing—models must now be defined with `defineModelSchema`/`createModelClass`.

### 1. Initialize the Client

`initializeClient(options)` constructs `JsBaoClient`, waits for the embedded database to be ready, and blocks until the new auth bootstrap sequence finishes (persisted JWT, cookie refresh, offline unlock, or OAuth handoff). Always await it before interacting with the client:

```typescript
import {
  initializeClient,
  defineModelSchema,
  createModelClass,
  InferAttrs,
  TypedModelConstructor,
} from "js-bao-wss-client";
import type { BaseModel } from "js-bao";

const contactSchema = defineModelSchema({
  name: "contacts",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    name: { type: "string", indexed: true },
    email: { type: "string", indexed: true },
    status: { type: "string", default: "Active" },
  },
});
type ContactAttrs = InferAttrs<typeof contactSchema>;
interface Contact extends ContactAttrs, BaseModel {}
const Contact: TypedModelConstructor<Contact> = createModelClass({
  schema: contactSchema,
});

async function bootstrap() {
  const client = await initializeClient({
    apiUrl: "https://your-api.example.com",
    wsUrl: "wss://your-ws.example.com",
    appId: "your-app-id",
    token: "your-jwt-token", // optional for OAuth/bootstrap
    // Optional: override the local query engine (defaults to SQL.js)
    databaseConfig: { type: "node-sqlite", options: { filePath: "./local.db" } },
    blobUploadConcurrency: 4, // optional (default 2 concurrent uploads)
    models: [Contact],

    // Optional behaviors
    offline: true, // enabled by default; set false to disable IndexedDB doc persistence
    auth: {
      persistJwtInStorage: true, // optional: reuse short-lived JWT across reloads while valid
      storageKeyPrefix: "my-app", // optional namespace when running multiple clients on same origin
    },
    autoOAuth: false,
    oauthRedirectUri: "https://your-app.com/oauth/callback",
    suppressAutoLoginMs: 5000,
    autoUnlockOfflineOnInit: true,
    autoNetwork: true,
    connectivityProbeTimeoutMs: 2000,
    onConnectivityCheck: undefined,
    globalAdminAppId: "global-admin-app",
    wsHeaders: undefined,
    logLevel: "info",
    maxReconnectDelay: 30,
  });

  return client;
}

const client = await bootstrap();
```

> **Note:** All following examples assume an async context (e.g., inside `async function main()` or using top-level await) so that `await initializeClient(...)` is valid.

#### Default behaviors

- `offline` mode is enabled unless you pass `offline: false`.
- `databaseConfig` defaults to `{ type: "sqljs" }`. Supply a different engine only if you need it.

### 2. Listen to Connection Events

```typescript
// Connection status
client.on("status", ({ status, net }) => {
  console.log("Connection status:", status, net); // status plus network snapshot
});

// Authentication events
client.on("auth-failed", ({ message }) => {
  console.error("Auth failed:", message);
  // Redirect user to login
});

client.on("auth-success", () => {
  console.log("Authentication successful");
});

client.on("auth:onlineAuthRequired", () => {
  // Went online without a token; prompt user to sign in
});

// Connection errors
client.on("connection-error", (error) => {
  console.error("Connection error:", error);
});

// Connection close
client.on("connection-close", (event) => {
  console.log("Connection closed:", event.code, event.reason);
});

// Network mode changes
client.on("networkMode", ({ mode }) => {
  console.log("Network mode:", mode);
});

// Auth lifecycle
client.on("auth:state", (s) => console.log("Auth state:", s));
client.on("auth:logout", () => {});
client.on("auth:logout:complete", () => {});

// Offline grant lifecycle
client.on("offlineAuth:enabled", () => {});
client.on("offlineAuth:unlocked", () => {});
client.on("offlineAuth:renewed", () => {});
client.on("offlineAuth:revoked", () => {});
client.on("offlineAuth:failed", () => {});
client.on("offlineAuth:expiringSoon", ({ daysLeft }) => {});
```

### Analytics

The client exposes a buffered analytics queue that batches events, retries on reconnect, and shares storage with offline persistence. Use it to emit custom instrumentation or rely on the built-in automatic events described below.

#### Client API

- `client.analytics.logEvent({ action, feature, context_json?, ... })`: enqueue a single event. `context_json` accepts an object (auto-serialized) or a JSON string.
- `client.analytics.flush()`: attempt to send the queue immediately; also runs automatically on reconnect and right before unload/destroy.
- `client.analytics.setPlanOverride(plan)` and `.setAppVersionOverride(version)`: stamp metadata onto every subsequent event until you clear or replace it.
- `client.getLlmAnalyticsContext()`: returns `{ logEvent, isEnabled }` when any LLM auto phases are enabled so higher-level features can coordinate their own analytics.

Queued events are persisted in IndexedDB when offline storage is active, so short offline windows or reloads do not drop data. Everything funnels through the same `analytics.batch` WebSocket channel used by the live event test.

#### Automatic events

All automatic emitters are on by default; pass `analyticsAutoEvents` when constructing the client to opt out per feature.

- `user_active_daily` (`feature: "session"`, toggle: `analyticsAutoEvents.dailyAuth`): first successful auth per calendar day.
- `user_returned` (`"session"`, respects `analyticsAutoEvents.minResumeMs`): fired when the tab becomes visible after being hidden long enough. `context_json.trigger` indicates `"visibility"` or `"manual"`.
- `client_boot` (`"session"`, toggle: `analyticsAutoEvents.boot`): exactly once per client instance.
- `first_doc_open` / `first_doc_edit` (`"documents"`, toggles: `analyticsAutoEvents.firstDocOpen`, `analyticsAutoEvents.firstDocEdit`): include the triggering `documentId`.
- `offline_recovery` (`"network"`, toggle: `analyticsAutoEvents.offlineRecovery.enabled`, throttled by `minIntervalMs`): logged when moving from offline back to online.
- `sync_error` (`"sync"`, toggle: `analyticsAutoEvents.syncErrors.enabled`): records the `documentId` and `reason` when flush/send attempts fail (with interval throttling).
- `blob_upload_started` / `blob_upload_succeeded` / `blob_upload_failed` (`"blobs"`, toggles: `analyticsAutoEvents.blobUploads.{start|success|failure}`): include blob/document identifiers, attempt counts, byte size, and retry details (with truncated error text on failure).
- `service_worker_control` / `service_worker_token_update` (`"service_worker"`, toggles: `analyticsAutoEvents.serviceWorker.{control|tokenUpdate}`): cover the bridge taking control and forwarding refreshed tokens (`context_json.cause` when available).
- `session_end` (`"session"`, toggle: `analyticsAutoEvents.sessionEnd`): emitted on `beforeunload` and `client.destroy()`, including `duration_ms` and exit reason.
- `gemini_request_started` / `gemini_request_succeeded` / `gemini_request_failed` (`"gemini"`, toggles: `analyticsAutoEvents.gemini.{start|success|failure}` or boolean): emitted for `client.gemini.generate()` and `client.gemini.countTokens()` lifecycles with model/context metadata.

When `analyticsAutoEvents.llm` enables any of `start`, `success`, or `failure`, `client.getLlmAnalyticsContext()` becomes non-null so LLM helpers can emit structured events without guessing configuration. `analyticsAutoEvents.gemini` controls `client.getGeminiAnalyticsContext()`, which powers automatic logging inside the Gemini namespace.

Example configuration:

```ts
const client = await initializeClient({
  ...options,
  analyticsAutoEvents: {
    firstDocEdit: false, // suppress milestone if your app logs a custom event
    blobUploads: { start: false, success: true, failure: true },
    llm: { start: true, success: true, failure: false },
  },
});
```

Manual `client.analytics.logEvent(...)` calls share the same queue and flush behaviour as the automatic stream, so custom events keep order/metadata without extra plumbing.

### Auth Events Reference

- **auth-failed**: Access token invalid/expired and refresh failed. Use this to trigger reauthentication.
  - Payload: `{ reason?: string; message?: string }`
- **auth-success**: Authentication succeeded or token refreshed.
  - Payload: none
- **auth-refresh-deferred**: Access token refresh was deferred due to connectivity issues. Use this to show "trying to reconnect" UI.
  - Payload: `{ status: "scheduled" | "offline"; nextAttemptMs?: number; cause?: string }`
- **auth:onlineAuthRequired**: Client attempted to go online without a token. Prompt for sign-in.
  - Payload: none
- **auth:logout**: Logout flow started (explicit sign-out). Clear app state/stop sensitive activities.
  - Payload: none
- **auth:logout:complete**: Logout flow finished.
  - Payload: none
- **auth:state**: Generic auth state changes.
  - Payload: `{ authenticated: boolean; mode: "online" | "offline" | "auto" | "none" }`

Minimal example to react when reauthentication is needed:

```typescript
const promptLogin = () => navigateToLogin();

client.on("auth-failed", promptLogin);
client.on("auth:onlineAuthRequired", promptLogin);
client.on("auth:state", ({ authenticated }) => {
  if (!authenticated) promptLogin();
});
```

### Persisting short-lived JWTs (optional)

By default the client keeps the access token in memory and relies on the refresh cookie whenever a reload happens. You can opt-in to caching the current short-lived JWT in IndexedDB so that a refresh can be skipped while the token is still valid:

```ts
const client = await initializeClient({
  ...options,
  auth: {
    persistJwtInStorage: true,
    storageKeyPrefix: "tenant-a", // optional namespace per app/user sandbox
  },
});

const info = client.getAuthPersistenceInfo();
// => { mode: "persisted", hydrated: false | true }
```

- The persisted token is only reused when it remains outside the refresh safety window (roughly 2 minutes before expiry). If the cached token is stale, the client falls back to the existing refresh flow.
- `storageKeyPrefix` lets you isolate multiple client instances that run on the same origin (e.g., multi-tenant dashboards or tests).
- Persistence is cleared automatically on logout, auth failures, or when you disable the feature. Apps that keep the default (`persistJwtInStorage` omitted) continue to run fully in-memory.
- Offline grants are unaffected; long-lived offline access still hinges on the encrypted grant workflow.

### First-party refresh proxy

Safari and other strict browsers block third-party cookies, so you can opt into a same-origin refresh proxy by wiring the client through your app worker:

```ts
const client = await initializeClient({
  ...options,
  auth: {
    refreshProxy: {
      baseUrl: `${window.location.origin}/proxy`,
      cookieMaxAgeSeconds: 7 * 24 * 60 * 60, // optional override (defaults to 7 days)
    },
  },
});
```

- `baseUrl` should be an absolute URL pointing to the first-party worker prefix that forwards to `/app/:appId/api/auth/*`.
- `cookieMaxAgeSeconds` lets you shorten/extend the refresh cookie TTL; omit it to use the worker default.
- Set `enabled: false` when you share config across environments but only want the proxy in production.
- Leave `auth.refreshProxy` undefined to preserve the existing direct-to-API behaviour.
- In local Vite development the sample app leaves the proxy disabled; set `VITE_USE_REFRESH_PROXY=true` to test the worker path locally.

### Document Lifecycle Events

```typescript
// Fires once per open call as soon as the Y.Doc is created and local wiring is ready
client.on("documentOpened", ({ documentId }) => {
  console.log("documentOpened:", documentId);
});

// Fires up to twice per open cycle after the initial wiring is complete:
// - once when initial data is loaded from IndexedDB (browser + offline: true) *after*
//   the local query engine (SQL.js/SQLite) has replayed/indexed the data
// - once when the document first becomes synced with the server
client.on(
  "documentLoaded",
  ({ documentId, source, hadData, bytes, elapsedMs }) => {
    console.log("documentLoaded:", {
      documentId,
      source,
      hadData,
      bytes,
      elapsedMs,
    });
  }
);

// Fires after a document is fully closed and all related resources are cleaned up
client.on("documentClosed", ({ documentId }) => {
  console.log("documentClosed:", documentId);
});

// Notes:
// - 'indexeddb' emits only when offline persistence is enabled and IndexedDB is available,
//   and only after the js-bao local query engine finishes connecting (SQLite/SQL.js indexes ready).
// - 'server' emits on first transition to synced per open cycle; hadData/bytes reflect server updates applied.
// - elapsedMs is measured from the start of documents.open for that document.
// - Unsubscribe listeners on unmount to avoid duplicate logs.
```

### documentMetadataChanged: payload details

The client emits `documentMetadataChanged` whenever local metadata changes or server metadata is merged into the local cache.

- Payload shape:

  - `{ documentId, metadata, changedFields?, action, source }`
  - **action**: `"created" | "updated" | "evicted" | "deleted"`
  - **source**: `"local" | "server"`
  - **changedFields**: array of field names that changed (when applicable)
  - **metadata**: an object with the most recent local view of metadata, or `null` for `evicted`/`deleted`

- Metadata fields (may be partially present):

  - `documentId: string`
  - `title?: string`
  - `lastKnownPermission?: "owner" | "read-write" | "reader" | "admin" | null`
  - `permissionCachedAt?: string` (ISO timestamp)
  - `lastOpenedAt?: string` (ISO timestamp)
  - `lastSyncedAt?: string` (ISO timestamp; updated on successful sync or server-merge)
  - `localBytes?: number` (approx bytes of IndexedDB update store when available)
  - `hasUnsyncedLocalChanges?: boolean`
  - `pendingCreate?: boolean` (true for client-created docs pending server commit)
  - `createdAt?: string` (ISO timestamp; local create time)
  - `localOnly?: boolean` (true for offline-only documents)

- Typical emissions:
  - **created/local**: immediately after `documents.create(...)` updates local cache. `changedFields` often includes `createdAt`, `pendingCreate`, `localOnly`, and optionally `title`.
  - **updated/local**: after local changes such as `documents.update(...)` (optimistic `title`), sync status updates (`lastSyncedAt`, `hasUnsyncedLocalChanges`), or localBytes refresh.
- **updated/server**: after `documents.list({ refreshFromServer: true })` or network-first list merges server metadata (e.g., `title`, `permission`), `changedFields` reflects updated properties.
- **evicted/local**: after `documents.evict(id)` or `documents.evictAll(...)`; `metadata` is `null`.
- **deleted/server or local**: the first delete seen (server push, list refresh, or local `documents.delete`) emits a single `deleted` event; subsequent delete/evict/list refreshes for the same doc are suppressed to avoid duplicates (including 404/offline fallbacks after a successful delete).

Example listener:

```ts
client.on("documentMetadataChanged", (updates) => {
  const u = Array.isArray(updates) ? updates[0] : updates;
  if (!u) return;
  // u: { documentId, metadata, changedFields?, action, source }
  console.log(
    "metadataChanged",
    u.documentId,
    u.action,
    u.source,
    u.changedFields
  );
});
```

## Offline-first: Open Behavior

The client supports non-blocking open so UIs can render immediately from local cache while network work continues in the background.

```typescript
const { doc, metadata } = await client.documents.open(documentId, {
  // Non-blocking knobs
  waitForLoad: "localIfAvailableElseNetwork", // "local" | "network" | "localIfAvailableElseNetwork" (default)
  enableNetworkSync: true, // false => per-doc manual start
  retainLocal: true, // keep local cache on close
  availabilityWaitMs: 30000, // network availability timeout (when needed)
});

// Manual start if you opened with enableNetworkSync: false
await client.startNetworkSync(documentId);
```

Events:

- **documentOpened**: Emitted once the Y.Doc exists and wiring is ready (before load events)
- **documentLoaded**: Per source (`indexeddb`/`server`); the `indexeddb` leg waits for replay plus SQLite/SQL.js indexing, the `server` leg fires on first sync. Payload `{ documentId, source, hadData, bytes?, elapsedMs }`.
- **documentClosed**: Emitted after a document is closed and cleanup completes
- **permission**: Emitted when permission changes; upgrade to write triggers a sync (respecting start mode)
- **documentMetadataChanged**: Unified metadata event. Payload shape:
  - `{ documentId, metadata, changedFields?, action, source }`
  - `action`: `"created" | "updated" | "evicted" | "deleted"`
  - `source`: `"local" | "server"`
  - `metadata`: may be `null` for `evicted`/`deleted`
- **pendingCreateCommitted** / **pendingCreateFailed**
- Existing: `sync`, `status`, `awareness`, `connection-error`, `connection-close`

### Permission changes auto-sync

When a document transitions from non-writable to writable (e.g., `reader` → `read-write`), the client automatically runs a sync so earlier local edits are pushed (subject to the document's start mode).

## Network Status / Offline Mode

```typescript
client.getNetworkStatus(); // { mode: "auto" | "online" | "offline", transport: "connected"|"connecting"|"disconnected", isOnline: boolean, connected?: boolean, lastOnlineAt?: string, lastError?: string }
client.isOnline(); // boolean
await client.setNetworkMode("offline");
await client.goOffline();
await client.goOnline();

// HTTP requests fail fast in offline mode
```

## Metadata Cache and Local Documents

The client maintains an IndexedDB-backed metadata index so apps can render lists and document summaries offline. Local listing is merged into `documents.list(...)`; the former `documents.listLocal()` is removed.

```typescript
// List documents (cache-first with background refresh by default)
const docs = await client.documents.list({
  includeRoot: false,
  // Default behavior is cache-first with background refresh when local cache exists
  // You can control it explicitly with waitForLoad (see below)
  waitForLoad: "localIfAvailableElseNetwork",
});

// List currently open documents (ids)
const open = await client.documents.listOpen();

// Get cached local metadata for a document
const meta = await client.documents.getLocalMetadata(documentId);

// Evict local data for a document (keeps remote doc intact)
await client.documents.evict(documentId);

// Evict all local data; onlySynced=true avoids unsynced-loss
await client.documents.evictAll({ onlySynced: true });

// Configure global retention
client.setRetentionPolicy({
  // e.g., { maxDocs?: number, maxBytes?: number, ttlMs?: number, defaultRetain?: "persist" | "session" }
});
```

Notes:

- The client updates the local metadata cache automatically when `documents.list()` returns server data (including last-known permission and root doc metadata). Root is always cached from the server but filtered out of the returned list unless you pass `includeRoot: true`.
- Cache updates emit `documentMetadataChanged` events (typically with `action: "updated"`, `source: "server"`).
- Local eviction emits `documentMetadataChanged` with `action: "evicted"`, `metadata: null`.
- Delete emits a single `documentMetadataChanged` with `action: "deleted"`, then evicts locally without a second emission.

### Listing options (waitForLoad)

`documents.list` supports the same high-level loading modes as `documents.open` via `waitForLoad`:

- "local": return local metadata immediately; no blocking network wait. If no local metadata exists, returns an empty list. If `refreshFromServer` is true (default), a background refresh runs to update the local cache.
- "network": block until the server responds (up to `serverTimeoutMs`, default 10000ms). If the client is explicitly offline, the call fails fast with code `LIST_UNAVAILABLE_OFFLINE`.
- "localIfAvailableElseNetwork" (default):
  - If any cached metadata exists, return it immediately and, when `refreshFromServer` is true, refresh in the background.
  - If no cached metadata exists, block on the server (like "network").

Additional flags:

- `includeRoot?: boolean` — include per-user root document(s) in the results. This strictly follows `waitForLoad`; it does not force a blocking network call.
- `refreshFromServer?: boolean` (default true unless `localOnly` is true) — controls whether a server request is made at all. Background refresh is only started when the primary flow returns immediately (i.e., it does not already block on network).
- `localOnly?: boolean` — short-circuits and returns only documents that have local data; no network access.
- `serverTimeoutMs?: number` — timeout for the blocking network path (when applicable).

### Pagination and tags

- Paging params: `limit`, `cursor`, `forward`, `returnPage`. Default sort is by `grantedAt` (document permission grant time) descending; pass `forward: true` for ascending.
- `returnPage: true` returns `{ items, cursor }` (backward-compatible array when omitted). With `refreshFromServer: true`, a background page walker fetches the remaining pages and updates the cache/`documentMetadataChanged` events; set `refreshFromServer: false` if you only want the first page. Note: cursors come from server responses; local-only/local-first paths do not fabricate cursors or enforce `limit` sizing—use `returnPage: true` when you need a cursor even if data is cached. To synchronously walk all pages yourself, loop on `{ returnPage: true, limit, cursor }` until `cursor` is null. To hydrate the full cache in one call, use `client.syncMetadata({ scope: "all", pageSize, includeRoot })` and then list with `refreshFromServer: false`.
- Server page size defaults to 100 when `limit` is omitted; you can request smaller/larger pages within server limits.
- Tag filtering: `tag: string` performs an exact-match filter server-side. Responses include `tags: string[]` and `grantedAt`; both are cached locally and usable offline (e.g., list + `tag` will be filtered from cache when offline/local-only). Root is also considered for tag queries—if you tag the root, it can appear in tag-filtered results even when the default list filters root out. When `refreshFromServer` is true with a tag, the client still fetches the full dataset in the background to keep the cache complete, then filters locally for the tag.
- Tag CRUD: server endpoints exist (`POST /documents/:id/tags { tag }`, `DELETE /documents/:id/tags/:tag`) and document create accepts optional tags; the high-level client currently exposes tagging via HTTP helpers or `client.makeRequest`.

Offline behavior:

- In explicit offline mode, "network" or the network leg of "localIfAvailableElseNetwork" fails fast with `LIST_UNAVAILABLE_OFFLINE`. "local" returns the local list (and skips background refresh).

## Local-first Document Creation (Client-generated ULIDs)

Create documents locally-first with a client-generated ULID. The client returns metadata immediately and, when not `localOnly`, marks as a pending create that is auto-committed when online.

```typescript
// Local-first create (returns metadata)
const { metadata } = await client.documents.create({ title: "Draft" });
const id = metadata.documentId;

// Optional: manual commit (default onExists: "link")
await client.documents.commitOfflineCreate(id, { onExists: "link" });

// Start sync (if you opened with manual start)
await client.startNetworkSync(id);

// Introspection
const pending = await client.documents.listPendingCreates();
const isPending = await client.documents.isPendingCreate(id);
await client.documents.cancelPendingCreate(id);
```

Events: `pendingCreateCommitted`, `pendingCreateFailed` help drive UI state.

## Root Documents

Some apps use a per-user root document. The server always returns the root in list responses (unless tag-filtered), and the client caches it. By default `documents.list()` filters it out; pass `includeRoot: true` to surface it (works offline after it’s cached).

```typescript
// Exclude root (default)
const docs = await client.documents.list();

// Include root document(s)
const all = await client.documents.list({ includeRoot: true });
```

## Behavior changes

- **Root documents listing**: `documents.list()` excludes root docs by default. Opt-in with `{ includeRoot: true }`.
- **Offline mode requests**: When `networkMode` is `"offline"`, HTTP calls fail fast with code `OFFLINE`.
- **Open options**: `documents.open()` uses `{ waitForLoad, enableNetworkSync, retainLocal, availabilityWaitMs }`. Older options like `waitForPermission`, `offlineWritePolicy`, per-doc `offline`, `provisionalPermission`, and `startNetwork` are removed.
- **Create return shape**: `documents.create()` returns `{ metadata }` (no `Y.Doc`).
- **Pending create events**: `pendingCreateCommitted`/`pendingCreateFailed` only (no `pendingCreate` at creation time).
- **Evict-all flag**: `documents.evictAll({ onlySynced })` (replaces `onlyUnsynced`).

## OAuth Authentication

```typescript
// Check if OAuth is available
const hasOAuth = await client.checkOAuthAvailable();
if (hasOAuth) {
  // Start OAuth flow (redirects to Google)
  await client.startOAuthFlow();
}

// Handle OAuth callback (in your callback page)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get("code");
const state = urlParams.get("state");

// Without constructing a client on the callback route:
import { JsBaoClient } from "js-bao-wss-client";

if (code && state) {
  try {
    const token = await JsBaoClient.exchangeOAuthCode({
      apiUrl: API_URL,
      appId: APP_ID,
      code,
      state,
    });

    // Persist token in your auth store and initialize the client later
    // (example only; use your own secure storage strategy)
    localStorage.setItem("jwt", token);
  } catch (error) {
    console.error("OAuth callback failed:", error);
  }
}

// Later (e.g., after redirecting back to your app shell):
import { initializeClient } from "js-bao-wss-client";

const client = await initializeClient({
  apiUrl: API_URL,
  wsUrl: WS_URL,
  appId: APP_ID,
  token,
  databaseConfig: { type: "sqljs" },
});

// Check authentication status
if (client.isAuthenticated()) {
  console.log("User is authenticated");
  const token = client.getToken();
}

// Manually set token
client.setToken("new-jwt-token");
```

## Magic Link Authentication

The client supports passwordless email authentication via magic links. Magic links must be enabled in the admin console for your app.

### Request Magic Link

```typescript
// Send a magic link email to the user
await client.magicLinkRequest("user@example.com");
```

### Handle Magic Link Callback

```typescript
// In your callback page (e.g., /oauth/callback)
const params = new URLSearchParams(window.location.search);
const magicToken = params.get("magic_token");

if (magicToken) {
  // Verify the token and complete authentication
  const { user, promptAddPasskey, isNewUser } = await client.magicLinkVerify(magicToken);
  console.log("Logged in as:", user.email);

  // isNewUser is true if this is the user's first sign-in (account was just created)
  if (isNewUser) {
    // Show onboarding flow for new users
  }

  // If promptAddPasskey is true, consider prompting the user to add a passkey
  if (promptAddPasskey) {
    // Show UI to add passkey for future logins
  }
}
```

## OTP (Email Code) Authentication

The client supports passwordless authentication via one-time 6-digit codes sent by email. OTP authentication must be enabled in the admin console for your app.

### Request OTP Code

```typescript
// Send a 6-digit code to the user's email
await client.otpRequest("user@example.com");
```

The code is valid for 10 minutes. Rate limits apply (5 codes per email per hour, 20 per IP per hour).

### Verify OTP Code

```typescript
// Verify the code and complete authentication
const { user, isNewUser } = await client.otpVerify("user@example.com", "123456");
console.log("Logged in as:", user.email);

// isNewUser is true if this is the user's first sign-in (account was just created)
if (isNewUser) {
  // Show onboarding flow for new users
}
```

### Error Handling

```typescript
try {
  await client.otpVerify("user@example.com", "123456");
} catch (error) {
  if (error.code === "OTP_NOT_ENABLED") {
    // OTP auth not enabled for this app
  } else if (error.code === "RATE_LIMITED") {
    // Too many attempts, try again later
  } else if (error.code === "OTP_MAX_ATTEMPTS") {
    // Maximum verification attempts exceeded, request a new code
  } else if (error.code === "INVALID_TOKEN") {
    // Invalid or expired code
  }
}
```

## Passkey Authentication

The client supports WebAuthn/passkey authentication for passwordless sign-in. Passkeys must be enabled in the admin console for your app.

Note: Passkeys can only be added to existing accounts (created via OAuth or Magic Link). To use passkey authentication:
1. User creates account via OAuth or Magic Link
2. User adds a passkey to their account
3. User can then sign in with the passkey on future visits

### Check Auth Methods Availability

```typescript
// Get auth configuration for the app
const config = await client.getAuthConfig();

// Check available authentication methods
if (config.hasPasskey) {
  console.log("Passkeys are available");
}
if (config.magicLinkEnabled) {
  console.log("Magic link sign-in is available");
}
if (config.otpEnabled) {
  console.log("OTP (email code) sign-in is available");
}
if (config.hasOAuth) {
  console.log("Google OAuth is available");
}
```

### Sign In with Passkey

```typescript
import { startAuthentication } from "@simplewebauthn/browser";

// 1. Get authentication options
const { options, challengeToken } = await client.passkeyAuthStart();

// 2. Authenticate with browser
const credential = await startAuthentication({ optionsJSON: options });

// 3. Complete authentication (sets token internally)
const { user, isNewUser } = await client.passkeyAuthFinish(credential, challengeToken);
console.log("Logged in as:", user.email);

// isNewUser is true if this is the user's first sign-in to this app
// (Note: for passkeys, this is rare since passkeys are added to existing accounts)
if (isNewUser) {
  // Show onboarding flow
}
```

### Add Passkey to Existing Account

```typescript
import { startRegistration } from "@simplewebauthn/browser";

// User must be authenticated

// 1. Get registration options
const { options, challengeToken } = await client.passkeyRegisterStart();

// 2. Create passkey with browser
const credential = await startRegistration({ optionsJSON: options });

// 3. Complete registration
await client.passkeyRegisterFinish(credential, challengeToken, "MacBook Pro");
```

### Manage Passkeys

```typescript
// List user's passkeys
const { passkeys } = await client.passkeyList();
console.log(passkeys); // [{ passkeyId, deviceName, createdAt, lastUsedAt }]

// Update a passkey's device name
const { passkey } = await client.passkeyUpdate(passkeyId, {
  deviceName: "Work MacBook",
});

// Delete a passkey
await client.passkeyDelete(passkeyId);
```

## Document Management

### Create and List Documents

```typescript
// Create a new document (returns metadata)
const { metadata } = await client.documents.create({
  title: "My New Document",
});
console.log("Created document:", metadata.documentId);

// List all documents user has access to
const documents = await client.documents.list();

// Get document details (network)
const docInfo = await client.documents.get(documentId);
console.log("Document:", docInfo.title, docInfo.permission);

// Update document (root titles cannot be changed)
const updatedDoc = await client.documents.update(documentId, {
  title: "Updated Title",
});

// Delete a document (offline/pending-create/not-found handled by local eviction)
// Throws if the document is currently open unless you force-close it first
await client.documents.delete(documentId, { forceCloseIfOpen: true }); // auto-closes if open
```

### Document Aliases

```typescript
// Create or update an app-scoped alias
await client.documents.aliases.set({
  scope: "app",
  aliasKey: "home",
  documentId,
});

// User-scoped alias (defaults userId to the current user)
await client.documents.aliases.set({
  scope: "user",
  aliasKey: "current-draft",
  documentId,
});

// Resolve an alias
const alias = await client.documents.aliases.resolve({
  scope: "app",
  aliasKey: "home",
});

// Open a document via alias (same return shape as documents.open)
const { doc } = await client.documents.openAlias({
  scope: "app",
  aliasKey: "home",
});

// List aliases for a document (admin-only on the server)
const aliases = await client.documents.aliases.listForDocument(documentId);

// Delete an alias (no error if already missing)
await client.documents.aliases.delete({ scope: "app", aliasKey: "home" });
```

#### Atomic Create with Alias

Create a document and alias in a single atomic operation. This is an **online-only** operation that only creates the document if the alias doesn't already exist:

```typescript
// Create document with app-scoped alias (requires admin/owner role)
const result = await client.documents.createWithAlias({
  title: "Home Page",
  alias: {
    scope: "app",
    aliasKey: "home",
  },
});

console.log(result.documentId); // The created document ID
console.log(result.alias.aliasKey); // "home"
console.log(result.alias.documentId); // Same as documentId

// Create document with user-scoped alias
const userResult = await client.documents.createWithAlias({
  title: "My Draft",
  alias: {
    scope: "user",
    aliasKey: "current-draft",
  },
});

// Attempting to create with existing alias throws HTTP 409
try {
  await client.documents.createWithAlias({
    title: "Another Home",
    alias: { scope: "app", aliasKey: "home" },
  });
} catch (err) {
  console.log("Alias already exists");
}
```

**Differences from separate `create()` + `aliases.set()`:**

- ✅ **Atomic**: Document is only created if alias doesn't exist
- ✅ **No race conditions**: Server-side transaction ensures consistency
- ✅ **Cleaner error handling**: Single 409 error if alias exists (no orphaned documents)
- ❌ **Online only**: Requires network connection (no offline support)

Use `createWithAlias()` when you need guaranteed uniqueness based on an alias (e.g., "only one home page per app"). Use regular `create()` + `aliases.set()` when offline support is needed or when the document should be created regardless of alias conflicts.

### Manage Permissions

```typescript
// Get document permissions
const permissions = await client.documents.getPermissions(documentId);
permissions.forEach((perm) => {
  console.log(`${perm.email}: ${perm.permission}`);
});

// Grant permission to a user
await client.documents.updatePermissions(documentId, {
  userId: "user-123",
  permission: "read-write", // 'owner' | 'read-write' | 'reader'
});

// Batch update permissions
await client.documents.updatePermissions(documentId, {
  permissions: [
    { userId: "user-1", permission: "read-write" },
    { userId: "user-2", permission: "reader" },
  ],
});

// Remove permission
await client.documents.removePermission(documentId, userId);

// Validate access to a document
const accessResult = await client.documents.validateAccess(documentId);
if (accessResult.hasAccess) {
  console.log("User has access:", accessResult.permission);
  if (accessResult.viaInvitation) {
    console.log("Access via invitation");
  }
}
```

## Blob Storage

Blobs are stored per document and inherit document permissions. The client exposes a `BlobsAPI` namespace under `documents`.

Access patterns:

```typescript
const blobs = client.document(documentId).blobs();
```

### Upload a Blob

```typescript
const data = new TextEncoder().encode("hello blob");
const { blobId, numBytes, contentType } = await blobs.upload(data, {
  filename: "hello.txt",
  contentType: "text/plain",
  disposition: "attachment", // or "inline"
  // sha256Base64?: optional; computed automatically if omitted
});
```

#### Alternate single-step helper

```typescript
// Convenience wrapper that returns { blobId, numBytes }
const { blobId, numBytes } = await client
  .document(documentId)
  .blobs()
  .uploadFile(new TextEncoder().encode("hello alt"), {
    filename: "alt.txt",
    contentType: "text/plain",
  });
```

### List Blobs (with pagination)

```typescript
const page1 = await client.document(documentId).blobs().list({ limit: 10 });
page1.items.forEach((b) => {
  console.log(b.blobId, b.filename, b.size);
});
if (page1.cursor) {
  const page2 = await blobs.list({ cursor: page1.cursor });
}
```

### Get Blob Metadata

```typescript
const meta = await client.document(documentId).blobs().get(blobId);
console.log(meta.filename, meta.contentType, meta.size);
```

### Get a Download URL

```typescript
// Returns a direct Worker URL (no presign). Add `disposition` to control attachment vs inline.
const url = client
  .document(documentId)
  .blobs()
  .downloadUrl(blobId, { disposition: "attachment" });
// e.g., use in browser: window.location.href = url
```

### Delete a Blob

```typescript
await client.document(documentId).blobs().delete(blobId); // { deleted: true }
```

### Read Cached Blobs (different shapes)

```typescript
const text = await client.document(documentId).blobs().read(blobId, {
  as: "text",
});
const arrayBuffer = await client
  .document(documentId)
  .blobs()
  .read(blobId, { as: "arrayBuffer" });
const blobObj = await client.document(documentId).blobs().read(blobId, {
  as: "blob",
});
const bytes = await client.document(documentId).blobs().read(blobId, {
  as: "uint8array",
});
```

- All reads hit the Cache API / IndexedDB cache when available.
- Pass `forceRedownload: true` to refresh from the server even if cached.
- `disposition` mirrors the URL helper if you need server-side content handling hints.

### Prefetch Blobs for Offline Use

```typescript
await client.document(documentId).blobs().prefetch([blobA, blobB], {
  concurrency: 4,
  forceRedownload: false,
});
```

Prefetch downloads the bytes into the Cache API/IndexedDB store so subsequent `read()` calls succeed offline.

### Inspect / Control the Upload Queue

```typescript
const uploadsApi = client.document(documentId).blobs();

// Queue status (includes in-flight + pending items)
uploadsApi.uploads().forEach((task) => {
  console.log(task.blobId, task.status);
});

// Pause/resume individual uploads
uploadsApi.pauseUpload(blobId);
uploadsApi.resumeUpload(blobId);

// Pause or resume everything for this document
uploadsApi.pauseAll();
uploadsApi.resumeAll();

// Global events (optional)
client.on("blobs:upload-progress", ([event]) => {
  console.log(event.queueId, event.status, event.bytesTransferred);
});
client.on("blobs:upload-completed", ([event]) => {
  console.log("done", event.queueId);
});
client.on("blobs:queue-drained", () => console.log("all uploads complete"));

// Adjust concurrency at runtime (minimum 1)
client.documents.setUploadConcurrency(5);
console.log("Current concurrency:", client.documents.getUploadConcurrency());
```

### Notes

- The client automatically computes base64 SHA-256 if not provided.
- Upload requires write-level permission (or admin/owner). Listing, metadata, and download require reader+.
- Uploads are queued when offline; the manager processes up to 2 uploads in parallel when network conditions allow. Pass `forceRedownload` to `read`/`prefetch` for fresh server bytes.
- Events (`blobs:*`) surface queue state for progress bars or toast notifications.
- Client-side max upload size is not enforced in the SDK.

## Offline Blob Storage

Blob storage is fully offline-aware:

1. **Uploads while offline**

   ```typescript
   await client.setNetworkMode("offline");
   const { blobId } = await client
     .document(documentId)
     .blobs()
     .upload(new TextEncoder().encode("draft"), {
       filename: "draft.txt",
       contentType: "text/plain",
     });

   // Inspect pending work
   console.log(client.document(documentId).blobs().uploads());
   ```

   - Bytes are written to the Cache API (browser) or kept in a short-lived in-memory map when caching is unavailable.
   - Queue entries persist in IndexedDB so refreshes or reconnects continue uploading.

2. **Reads when offline**

   ```typescript
   const text = await client.document(documentId).blobs().read(blobId, {
     as: "text",
   });
   // Works offline thanks to the cached bytes
   ```

3. **Coming back online**

   ```typescript
   await client.setNetworkMode("online");
   // Queue processes automatically; listen to blobs:queue-drained for completion
   ```

4. **Prefetch before going offline**

   ```typescript
   await client.document(documentId).blobs().prefetch(importantBlobIds);
   ```

   Prefetched blobs remain available for subsequent offline `read()` calls.

5. **Retention**

   - Set `retainLocal: false` on upload options to drop cached bytes after success while leaving metadata intact.
   - `delete()` removes queue entries, cached bytes, and server objects by default.

### Service Worker Integration

`BlobManager` caches blob responses in the shared Cache API (`js-bao-blobs:<appId>:<userId>`) and now exposes helpers so UI code can coordinate with the service worker:

```ts
const blobs = client.documents.blobs(documentId);
if (!blobs.hasServiceWorkerControl()) {
  console.warn("Service worker has not taken control yet");
}
const url = blobs.proxyUrl(blobId, {
  disposition: "attachment",
  attachmentFilename: "report.pdf",
});
imageElement.src = url;
```

The client now posts these messages for you (including `apiBaseUrl`, `cachePrefix`, and the current token). To opt out (and send custom payloads) set `serviceWorkerBridge: { enabled: false }` when constructing `JsBaoClient`. Apps that never register a service worker simply ignore the bridge while continuing to use the shared Cache API for `read()` calls.

To support `<img>`/`<video>` tags and other non-authenticated fetches, add a service worker handler for requests on the same origin that match `/app/{appId}/api/documents/{documentId}/blobs/{blobId}/download`. The handler should swap the origin to the API host provided in the bridge payload, attach auth headers, fall back to the network when needed, and mirror the Cache API used by the main thread. A complete example:

```ts
// sw.js

const STATE = {
  appId: null,
  userId: null,
  token: null,
  cachePrefix: null,
  globalAdminAppId: null,
  apiBaseUrl: null,
};

// In-memory metadata example; persist to IndexedDB if you need SW restarts to keep state.
const BLOB_METADATA = new Map();

self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};
  if (!type || !payload) return;

  if (type === "jsBao:init") {
    STATE.appId = payload.appId ?? STATE.appId;
    STATE.userId = payload.userId ?? STATE.userId;
    STATE.cachePrefix = payload.blobs?.cachePrefix ?? STATE.cachePrefix;
    STATE.globalAdminAppId = payload.globalAdminAppId ?? STATE.globalAdminAppId;
    STATE.apiBaseUrl = payload.apiBaseUrl ?? STATE.apiBaseUrl;
    STATE.token = payload.auth?.token ?? STATE.token;
  } else if (type === "jsBao:tokenUpdated") {
    STATE.token = payload.token ?? STATE.token;
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const apiOrigin = STATE.apiBaseUrl ?? self.location.origin;
  if (url.origin !== apiOrigin) return;
  if (!STATE.appId) return;
  if (!url.pathname.startsWith(`/app/${STATE.appId}/api/documents/`)) return;
  if (!url.pathname.includes("/blobs/")) return;
  if (!url.pathname.endsWith("/download")) return;

  event.respondWith(handleProxy(event.request));
});

async function handleProxy(request) {
  if (!STATE.appId) {
    return fetch(request);
  }

  const requestUrl = new URL(request.url);
  const apiBase = STATE.apiBaseUrl
    ? new URL(STATE.apiBaseUrl)
    : new URL(requestUrl.origin);
  const upstreamUrl = new URL(
    `${requestUrl.pathname}${requestUrl.search}`,
    apiBase.origin
  );

  const canonicalKey = buildCanonicalKey(apiBase.origin, requestUrl.pathname);
  const metadata = extractDispositionMetadata(requestUrl);
  if (metadata) {
    BLOB_METADATA.set(canonicalKey, metadata);
  }

  const headers = new Headers(request.headers);
  if (STATE.token) {
    headers.set("Authorization", `Bearer ${STATE.token}`);
  }
  if (STATE.globalAdminAppId) {
    headers.set("X-Global-Admin-App-Id", STATE.globalAdminAppId);
  }

  const upstreamRequest = new Request(upstreamUrl.toString(), {
    method: request.method,
    headers,
    redirect: request.redirect,
    cache: "no-store",
    credentials: "omit",
    mode: "cors",
  });

  const cacheName =
    STATE.cachePrefix ?? `js-bao-blobs:${STATE.appId}:${STATE.userId}`;
  const cache = await caches.open(cacheName);

  const canonicalRequest = new Request(canonicalKey, { method: "GET" });
  const effectiveMetadata = metadata ?? BLOB_METADATA.get(canonicalKey) ?? null;

  const cached = await cache.match(canonicalRequest);
  if (cached) {
    return applyDisposition(cached, effectiveMetadata);
  }

  const upstream = await fetch(upstreamRequest);
  if (!upstream.ok || request.method !== "GET") {
    return upstream;
  }

  const sanitized = stripDisposition(upstream);
  try {
    await cache.put(canonicalRequest, sanitized.clone());
  } catch (err) {
    console.warn("[SW] Failed to write blob cache entry", err);
  }

  return applyDisposition(sanitized, effectiveMetadata);
}

function buildCanonicalKey(origin, pathname) {
  return new URL(pathname, origin).toString();
}

function extractDispositionMetadata(url) {
  const disposition = url.searchParams.get("disposition");
  if (!disposition) return null;
  const attachmentFilename =
    url.searchParams.get("attachmentFilename") ?? undefined;
  return { disposition, attachmentFilename };
}

function stripDisposition(response) {
  const headers = new Headers(response.headers);
  headers.delete("Content-Disposition");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function applyDisposition(response, metadata) {
  if (!metadata) return response;

  const headers = new Headers(response.headers);
  headers.delete("Content-Disposition");

  if (metadata.disposition === "inline") {
    headers.set("Content-Disposition", "inline");
  } else if (metadata.disposition === "attachment") {
    const filename = metadata.attachmentFilename;
    if (filename) {
      headers.set(
        "Content-Disposition",
        `attachment; filename="${sanitizeAsciiFilename(
          filename
        )}"; filename*=UTF-8''${encodeRFC5987(filename)}`
      );
    } else {
      headers.set("Content-Disposition", "attachment");
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function sanitizeAsciiFilename(filename) {
  return filename.replace(/["\\]/g, "_");
}

function encodeRFC5987(value) {
  return encodeURIComponent(value)
    .replace(
      /['()*]/g,
      (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
    )
    .replace(/%(7C|60|5E)/g, (_, hex) => `%${hex.toLowerCase()}`);
}
```

The canonical request uses only `origin + pathname`, so all disposition variants reuse the same cache entry. Metadata can live in memory (as shown) or in IndexedDB if you need to survive worker restarts. Because cached responses are stored without `Content-Disposition`, each hit reapplies headers based on the active request. Extend the sample with background eviction or cache versioning as needed.

### Document Invitations

```typescript
// Create an invitation
const invitation = await client.documents.createInvitation(
  documentId,
  "user@example.com",
  "read-write" // 'owner' | 'read-write' | 'reader'
);
console.log("Invitation created:", invitation.invitationId);

// List all invitations for a document
const invitations = await client.documents.listInvitations(documentId);

// Update an invitation (changes permission)
const updatedInvitation = await client.documents.updateInvitation(
  documentId,
  "user@example.com",
  "reader"
);

// Get specific invitation
const inv = await client.documents.getInvitation(
  documentId,
  "user@example.com"
);

// Delete an invitation
await client.documents.deleteInvitation(documentId, invitationId);

// Accept or decline (invitee)
await client.document(documentId).acceptInvitation();
await client.document(documentId).declineInvitation(invitationId);
```

### Pending Document Invitations (for the current user)

```typescript
// List documents you’ve been invited to (pending, unexpired)
const pending = await client.me.pendingDocumentInvitations();
// Each item includes a best-effort `document` block with metadata (title, tags, createdAt, lastModified, createdBy)
for (const inv of pending) {
  console.log(inv.document?.title, inv.document?.tags);
}
```

### Users

```typescript
// Look up basic profile info for a user in the current app (cached like `me`)
const user = await client.users.getBasic("u01H...");
console.log(user.name, user.email, user.appRole);
```

### Invitation events

The client emits a unified `invitation` event for real-time invitation changes delivered over the WebSocket. Payload:

- `{ type: "invitation"; action: "created" | "updated" | "cancelled" | "declined"; invitationId; documentId; permission; title?; invitedBy?; invitedAt?; expiresAt?; document?: { title?; tags?; createdAt?; lastModified?; createdBy? } }`

Example:

```ts
client.on("invitation", (evt) => {
  const { action, documentId, invitationId, permission, title } = evt;
  console.log("invitation event", action, documentId, invitationId, permission, title);
});
```

Use this to refresh invitation lists or badge counts without polling.

## Large Language Models (LLM)

```typescript
// List available models
const { models, defaultModel } = await client.llm.models();
console.log("Default model:", defaultModel);

// Basic chat
const reply = await client.llm.chat({
  // model is optional; uses server default when omitted
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Summarize: Collaborative editing with Yjs." },
  ],
  temperature: 0.2,
  max_tokens: 512,
  reasoning: {
    effort: "medium",
    exclude: false,
  },
});
console.log(reply.content);

// Chat with image attachment (base64-encoded PNG)
const imageBase64 = await loadImageAsBase64("/path/to/screenshot.png");
const imageReply = await client.llm.chat({
  messages: [
    {
      role: "system",
      content: "You analyze screenshots and respond helpfully.",
    },
    { role: "user", content: "Describe what you see in this image." },
  ],
  attachments: [
    {
      type: "image",
      mime: "image/png",
      base64: imageBase64,
    },
  ],
});
console.log(imageReply.content);
```

## Gemini

```typescript
// Text generation with optional structured output
const result = await client.gemini.generate({
  messages: [
    {
      role: "system",
      parts: [{ type: "text", text: "Reply in JSON with keys title and summary." }],
    },
    {
      role: "user",
      parts: [{ type: "text", text: "Summarize collaborative editing with Yjs." }],
    },
  ],
  structuredOutput: {
    responseMimeType: "application/json",
    responseJsonSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
      },
      required: ["title", "summary"],
    },
  },
});
console.log(result.message.parts[0].text);

// Multimodal prompt with inline image data
const screenshot = await loadImageAsBase64("/path/to/screenshot.png");
await client.gemini.generate({
  messages: [
    {
      role: "user",
      parts: [
        { type: "text", text: "Describe this screenshot." },
        { type: "image", mimeType: "image/png", base64Data: screenshot },
      ],
    },
  ],
});

// Raw passthrough using Google's payload schema
const rawPayload = {
  contents: [
    {
      role: "user",
      parts: [
        {
          text: "Summarize this JSON.",
        },
        {
          inline_data: {
            mimeType: "application/json",
            data: someBase64Json,
          },
        },
      ],
    },
  ],
};
const rawResponse = await client.gemini.generateRaw({
  model: "models/gemini-2.5-flash",
  body: rawPayload,
});
console.log(rawResponse.candidates?.[0]?.content);

// Token usage estimation
const tokens = await client.gemini.countTokens({
  model: "models/gemini-2.5-flash",
  messages: [{ role: "user", parts: [{ type: "text", text: "How many tokens?" }] }],
});
console.log(tokens.totalTokens);
```

### Gemini Configuration & Notes

- `client.gemini` proxies to Cloudflare worker routes:
  - `GET /gemini/models` → `client.gemini.models()`
  - `POST /gemini/generate` → `client.gemini.generate(...)`
  - `POST /gemini/count-tokens` → `client.gemini.countTokens(...)`
  - `POST /gemini/generate-raw` → `client.gemini.generateRaw({ model, body })`
  These endpoints run server-side, so browser clients never see Google credentials.
- Deployments must configure a Gemini key in the worker environment (`GEMINI_API_KEY`, `GEMINI_API_TOKEN`, or `GEMINI_KEY`). Optional helpers:
  - `GEMINI_DEFAULT_MODEL` (e.g. `models/gemini-2.5-flash`)
  - `GEMINI_ALLOWED_MODELS` (comma-separated allowlist such as `models/gemini-2.5-flash,models/gemini-2.5-pro`).
- Inline multimodal content uses base64 `parts` (text, image, file). Large file uploads can be added later via the Gemini Files API; V1 augments prompts with base64-inlined payloads up to ~25 MB.
- Structured output leverages `generationConfig.responseMimeType` plus optional `responseSchema` / `responseJsonSchema` so Gemini can return deterministic JSON. The full server response is always available via the `raw` field when you need annotations or safety metadata.
- Error handling surfaces `JsBaoError` with `code: "GEMINI_ERROR"`; the `details` property contains the raw upstream payload so you can log or render troubleshooting info.
- See `.dev.local.example` for sample environment values and `docs/gemini-direct-plan.md` for architectural details.

## Workflows

Workflows allow you to execute server-side, multi-step processes that can include LLM calls, delays, transformations, and more. The client provides APIs to start workflows, monitor their status, and receive real-time completion events.

### Starting a Workflow

```typescript
// Start a workflow with input data
const result = await client.workflows.start({
  workflowKey: "my-workflow-key",
  input: {
    message: "Hello world",
    value: 42,
  },
});

console.log("Run started:", result.runKey);
console.log("Run ID:", result.runId);
console.log("Status:", result.status);
```

#### Start Options

```typescript
const result = await client.workflows.start({
  // The workflow key (required)
  workflowKey: "my-workflow-key",
  // Input data passed to the workflow (optional, defaults to {})
  input: { message: "Hello" },
  // Provide a custom runKey for idempotency (auto-generated if omitted)
  runKey: "unique-run-identifier",
  // Associate the run with a document
  contextDocId: "doc-123",
  // Pass additional metadata (max 1KB, returned in listRuns/getStatus)
  meta: { source: "user-action", priority: "high" },
});
```

### Document-Scoped Workflows

Workflows can be scoped to a specific document using `contextDocId`. This is useful when:
- Processing document-specific data
- Running workflows in the context of a particular document
- Allowing the same `runKey` to be used across different documents

The workflow instance ID is built from `{appId}:{contextDocId}:{runKey}`, so a workflow started with one `contextDocId` cannot be accessed with a different one.

```typescript
// Start a workflow scoped to a document
const result = await client.workflows.start({
  workflowKey: "process-document",
  input: { action: "analyze" },
  contextDocId: "doc-123",
  runKey: "analyze-v1",
});

// Must use the same contextDocId for all operations
const status = await client.workflows.getStatus({
  workflowKey: "process-document",
  runKey: "analyze-v1",
  contextDocId: "doc-123",
});
await client.workflows.terminate({
  workflowKey: "process-document",
  runKey: "analyze-v1",
  contextDocId: "doc-123",
});

// List runs for this document
const runs = await client.workflows.listRuns({ contextDocId: "doc-123" });
```

If `contextDocId` is omitted, the user's root document is used by default.

### Duplicate Workflow Protection (Idempotency)

When you provide a `runKey`, the server ensures only one workflow run exists for that key. If you call `start()` again with the same `runKey`, the existing run is returned instead of creating a new one:

```typescript
// First call creates the workflow
const first = await client.workflows.start({
  workflowKey: "process-document",
  input: { docId: "abc" },
  runKey: "process-abc-v1",
});
console.log(first.existing); // false - new run created

// Second call with same runKey returns existing run
const second = await client.workflows.start({
  workflowKey: "process-document",
  input: { docId: "abc" },
  runKey: "process-abc-v1",
});
console.log(second.existing); // true - existing run returned
console.log(second.runId === first.runId); // true - same run
```

This is useful for:
- Preventing duplicate processing when users click a button multiple times
- Safely retrying failed requests without creating duplicate work
- Implementing exactly-once semantics for critical operations

### Checking Workflow Status

Poll the status of a running workflow:

```typescript
const status = await client.workflows.getStatus({
  workflowKey: "my-workflow-key",
  runKey,
});

console.log("Status:", status.status); // "running" | "complete" | "failed" | "terminated"

if (status.status === "complete") {
  console.log("Output:", status.output);
}

if (status.status === "failed") {
  console.log("Error:", status.error);
}
```

If you started the workflow with a specific `contextDocId`, you must provide the same `contextDocId` when checking status:

```typescript
// Start workflow with contextDocId
const result = await client.workflows.start({
  workflowKey: "my-workflow",
  input: { data: "..." },
  contextDocId: "doc-123",
});

// Get status - must provide the same contextDocId
const status = await client.workflows.getStatus({
  workflowKey: "my-workflow",
  runKey: result.runKey,
  contextDocId: "doc-123",
});
```

If `contextDocId` is omitted, the user's root document is used by default.

### Listening for Workflow Events

Subscribe to real-time workflow events via WebSocket:

```typescript
// Listen for when a workflow starts
client.on("workflowStarted", (event) => {
  console.log("Workflow started:", event.workflowKey, event.runKey);
  console.log("Instance:", event.instanceId);
  console.log("Meta:", event.meta);
});

// Listen for workflow completion/failure
client.on("workflowStatus", (event) => {
  console.log("Workflow event:", event.workflowKey, event.runKey);
  console.log("Status:", event.status); // "completed" | "failed" | "terminated"

  if (event.status === "completed") {
    console.log("Output:", event.output);
  }

  if (event.status === "failed") {
    console.log("Error:", event.error);
  }
});
```

**Note**: To receive workflow events, you must have an active WebSocket connection. Opening a document establishes this connection:

```typescript
// Open a document to establish WebSocket for receiving notifications
await client.documents.open(documentId);

// Now workflow events will be delivered
const result = await client.workflows.start({ workflowKey: "my-workflow", input: { data: "..." } });
```

#### Event Payload

```typescript
interface WorkflowStatusEvent {
  type: "workflowStatus";
  workflowKey: string;
  workflowId: string;
  runKey: string;
  runId: string;
  status: "completed" | "failed" | "terminated";
  output?: any;
  error?: string;
  contextDocId?: string;
  needsApply?: boolean; // true when workflow requires client-side apply
}
```

### Listing Workflow Runs

View all workflow runs for the current user:

```typescript
// List all runs
const runs = await client.workflows.listRuns();
console.log("Total runs:", runs.items.length);

runs.items.forEach((run) => {
  console.log(run.runKey, run.status, run.createdAt);
});

// Filter by workflow
const filtered = await client.workflows.listRuns({
  workflowKey: "my-workflow",
});

// Filter by status
const running = await client.workflows.listRuns({
  status: "running",
});

// Filter by document - list runs associated with a specific document
const docRuns = await client.workflows.listRuns({
  contextDocId: "doc-123",
});

// Pagination
const page1 = await client.workflows.listRuns({ limit: 10 });
if (page1.cursor) {
  const page2 = await client.workflows.listRuns({
    limit: 10,
    cursor: page1.cursor,
  });
}

// Sort order - default is newest first (descending by modifiedAt)
const newestFirst = await client.workflows.listRuns(); // default
const oldestFirst = await client.workflows.listRuns({ forward: true });

// Combine filters
const combined = await client.workflows.listRuns({
  contextDocId: "doc-123",
  status: "complete",
  forward: true,
  limit: 20,
});
```

#### Run Record Fields

```typescript
interface WorkflowRun {
  runId: string;
  runKey: string;
  instanceId: string;
  workflowId: string;
  workflowKey: string;
  revisionId: string;
  contextDocId?: string;
  status: string;
  createdAt: string;
  endedAt?: string;
}
```

### Terminating a Workflow

Cancel a running workflow:

```typescript
const result = await client.workflows.terminate({
  workflowKey: "my-workflow-key",
  runKey,
});
console.log("Terminated, final status:", result.status);
```

If you started the workflow with a specific `contextDocId`, you must provide the same `contextDocId` when terminating:

```typescript
// Terminate a workflow started with contextDocId
const result = await client.workflows.terminate({
  workflowKey: "my-workflow-key",
  runKey,
  contextDocId: "doc-123",
});
```

### Applying Workflow Results to Documents

When a workflow completes, its result can be applied to a Yjs document by exactly one connected client. This prevents duplicate writes when multiple tabs or devices are connected to the same document.

Use `workflows.define()` to register an apply handler at initialization. The client automatically claims, applies, and confirms workflow results:

```typescript
// Define a workflow with its apply handler (call once at startup)
client.workflows.define("my-workflow-key", {
  onApply: async ({ output, workflowKey, runKey, contextDocId }) => {
    // Use models to apply the workflow result to the document
    const contact = new Contact({
      name: output.contactName,
      email: output.contactEmail,
    });
    await contact.save({ targetDocument: contextDocId });
  },
});
```

**How it works:**

1. Workflow completes → server sets status to `apply_pending`
2. All connected clients receive a `workflowStatus` event with `needsApply: true`
3. The first client to call `claimApply` wins (conditional DynamoDB update)
4. The claiming client runs the registered `onApply` handler
5. On success, `confirmApply` marks the run as `completed`
6. On failure, `releaseApply` releases the claim so another client can retry
7. A 30-second lease timeout handles crashed clients

The claim/confirm/release cycle is handled automatically when you use `workflows.define()`. For manual control:

```typescript
// Manual claim/confirm flow
const claim = await client.workflows.claimApply({
  workflowKey: "my-workflow-key",
  runKey: "run-123",
  contextDocId: "doc-456",
});

if (claim.claimed) {
  try {
    // Apply result to document...
    await client.workflows.confirmApply({
      workflowKey: "my-workflow-key",
      runKey: "run-123",
      contextDocId: "doc-456",
    });
  } catch (err) {
    // Release so another client can retry
    // (handled automatically with workflows.define)
  }
}
```

### Sending File Attachments (PDFs, Images)

Workflows can process files like PDFs and images. Files must be base64-encoded before sending:

```typescript
/**
 * Load a file and convert to base64.
 * Works in browsers with fetch + FileReader or ArrayBuffer.
 */
async function loadFileAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Load a PDF and send to workflow
const pdfBase64 = await loadFileAsBase64("/path/to/document.pdf");

const result = await client.workflows.start({
  workflowKey: "extract-pdf-data",
  input: {
    attachments: [
      {
        data: pdfBase64,
        type: "application/pdf",
      },
    ],
  },
});
```

#### Loading from File Input (Browser)

```typescript
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Handle file input
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  const base64Data = await fileToBase64(file);

  const result = await client.workflows.start({
    workflowKey: "process-upload",
    input: {
      attachments: [
        {
          data: base64Data,
          type: file.type, // e.g., "image/png", "application/pdf"
          filename: file.name,
        },
      ],
    },
  });
});
```

#### Loading from URL (Node.js)

```typescript
import * as fs from "fs";
import * as path from "path";

function loadFileAsBase64Sync(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString("base64");
}

const pdfPath = path.join(__dirname, "document.pdf");
const pdfBase64 = loadFileAsBase64Sync(pdfPath);

const result = await client.workflows.start({
  workflowKey: "analyze-document",
  input: {
    attachments: [
      {
        data: pdfBase64,
        type: "application/pdf",
      },
    ],
  },
});
```

### Complete Example: PDF Processing Workflow

```typescript
import { initializeClient } from "js-bao-wss-client";

async function processPDF(pdfUrl: string) {
  const client = await initializeClient({
    apiUrl: "https://api.example.com",
    wsUrl: "wss://ws.example.com",
    appId: "my-app",
    token: "jwt-token",
    databaseConfig: { type: "sqljs" },
  });

  // Set up event listener for completion
  const completionPromise = new Promise<any>((resolve) => {
    client.on("workflowStatus", (event) => {
      if (event.status === "completed") {
        resolve(event.output);
      }
    });
  });

  // Open a document to establish WebSocket connection
  const { metadata } = await client.documents.create({ title: "temp" });
  await client.documents.open(metadata.documentId);

  // Load and encode the PDF
  const response = await fetch(pdfUrl);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const pdfBase64 = btoa(binary);

  // Start the workflow
  const result = await client.workflows.start({
    workflowKey: "extract-pdf-data",
    input: {
      attachments: [
        {
          data: pdfBase64,
          type: "application/pdf",
        },
      ],
    },
  });

  console.log("Workflow started:", result.runKey);

  // Wait for completion (or poll with getStatus)
  const output = await completionPromise;
  console.log("Extracted data:", output);

  // Cleanup
  await client.documents.delete(metadata.documentId);
  await client.destroy();

  return output;
}
```

### Polling for Completion

If you prefer polling over WebSocket events:

```typescript
async function waitForCompletion(
  client: JsBaoClient,
  workflowKey: string,
  runKey: string,
  timeoutMs = 60000,
  intervalMs = 2000
): Promise<any> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const status = await client.workflows.getStatus({ workflowKey, runKey });

    if (status.status === "complete") {
      return status.output;
    }

    if (status.status === "failed") {
      throw new Error(`Workflow failed: ${status.error}`);
    }

    if (status.status === "terminated") {
      throw new Error("Workflow was terminated");
    }

    // Still running, wait and retry
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("Workflow timed out");
}

// Usage
const result = await client.workflows.start({ workflowKey: "my-workflow", input: { data: "..." } });
const output = await waitForCompletion(client, "my-workflow", result.runKey);
```

## Integrations API

Proxy HTTP calls through the tenant-specific integrations defined in the admin UI:

```typescript
const response = await client.integrations.call({
  integrationKey: "weather-api",
  method: "GET",
  path: "/current",
  query: { city: "San Francisco" },
  headers: { "X-Debug": "true" },
});

console.log(response.status);     // Upstream status code
console.log(response.body);       // JSON returned by the provider
console.log(response.traceId);    // Proxy trace id (mirrors admin logs)
console.log(response.durationMs); // Milliseconds spent in the worker
```

- `integrationKey` – slug chosen in the admin UI. Keys are per-app.
- `method`, `path`, `query`, `headers`, `body` – forwarded exactly as provided, but the worker enforces the integration’s allowlisted methods/paths, forwarded headers/query params, max body size, and timeout.
- Success responses include the upstream `status`, `headers`, `body`, optional `traceId`, and `durationMs`.

### Errors

`client.integrations.call` throws `JsBaoError` with rich codes:

- `OFFLINE` – The SDK is forced offline (`networkMode = "offline"`).
- `ACCESS_DENIED` – Missing/expired JWT.
- `INTEGRATION_NOT_FOUND` – Integration removed/archived or typo in `integrationKey`.
- `INTEGRATION_SECRET_MISSING` – Admin hasn’t uploaded credentials yet.
- `INTEGRATION_REQUEST_INVALID` – Method/path/query/body violate guard rails (`DISALLOWED_METHOD`, `REQUEST_BODY_TOO_LARGE`, etc.).
- `INTEGRATION_PROXY_FAILED` – Upstream timeout/5xx. Inspect `error.details.traceId` to correlate with admin logs.

Example handler:

```typescript
import { isJsBaoError } from "js-bao-wss-client";

try {
  await client.integrations.call({ integrationKey: "crm", method: "POST", path: "/contacts", body: { email: "hi" } });
} catch (error) {
  if (isJsBaoError(error)) {
    switch (error.code) {
      case "INTEGRATION_NOT_FOUND":
        alert("This integration is not available. Contact your admin.");
        break;
      case "INTEGRATION_SECRET_MISSING":
        alert("Configuration incomplete. Try again later.");
        break;
      case "INTEGRATION_REQUEST_INVALID":
        console.error("Request violates integration config", error.details);
        break;
      case "INTEGRATION_PROXY_FAILED":
        console.error("Upstream failed", error.details?.traceId);
        break;
      default:
        throw error;
    }
  } else {
    throw error;
  }
}
```

## Real-time Collaboration

### Open and Edit Documents

```typescript
import * as Y from "yjs";

// Open a document for real-time editing
const { doc: ydoc } = await client.documents.open(documentId, {
  waitForLoad: "localIfAvailableElseNetwork",
  enableNetworkSync: true,
});
if (!ydoc) throw new Error("No local copy available and network required");

// Get shared types from the Y.Doc
const ytext = ydoc.getText("content");
const ymap = ydoc.getMap("metadata");

// Listen for document changes
ydoc.on("update", (update) => {
  console.log("Document updated locally or remotely");
});

// Make changes to the document (only if not read-only)
if (!client.documents.isReadOnly(documentId)) {
  ytext.insert(0, "Hello, world!");
  ymap.set("title", "My Document");
  ymap.set("lastModified", new Date().toISOString());
}

// Check document permission and read-only status
const permission = client.documents.getDocumentPermission(documentId);
console.log("User permission:", permission); // 'owner' | 'read-write' | 'reader' | 'admin'

if (client.documents.isReadOnly(documentId)) {
  console.log("Document is read-only");
}

// Check sync status
if (client.documents.isSynced(documentId)) {
  console.log("Document is synced with server");
}

// Listen for sync events
client.on("sync", ({ documentId, synced }) => {
  console.log(`Document ${documentId} sync status: ${synced}`);
});

// Close document when done
await client.documents.close(documentId);
```

## Document-to-Model Mapping (ORM Integration)

The client provides APIs to route js-bao ORM queries to specific Y.Docs. This allows you to work with multiple documents simultaneously while maintaining clear model-to-document associations.

### Basic Concepts

- **Model mapping**: Explicitly routes a specific model class to a specific document
- **Default document**: Fallback document for models without explicit mappings
- **Resolution hierarchy**: Model mapping → Default document → Error

### Setting a Default Document

Use `setDefaultDocumentId()` to establish a fallback document for all unmapped models:

```typescript
// Open a document first (required)
const { doc } = await client.documents.open("my-default-doc");

// Set it as the default for unmapped models
client.setDefaultDocumentId("my-default-doc");

// Now any model without an explicit mapping will use this document
// e.g., Contact.query() → runs against 'my-default-doc'
```

**Important**: Documents must be open before setting as default. The method throws if the document isn't already open.

### Mapping Specific Models

Use `addDocumentModelMapping()` to route individual models to specific documents:

```typescript
// Open the documents you want to use
await client.documents.open("users-doc");
await client.documents.open("tasks-doc");

// Map specific models
client.addDocumentModelMapping("Contact", "users-doc");
client.addDocumentModelMapping("Task", "tasks-doc");

// Now queries route correctly:
// Contact.query() → uses 'users-doc'
// Task.query() → uses 'tasks-doc'
```

### Complete Example: Multi-Document Application

```typescript
import { initializeClient } from "js-bao-wss-client";
import { Contact, Task, Note } from "./models";

async function setupModels() {
  const client = await initializeClient({
    apiUrl: "https://api.example.com",
    wsUrl: "wss://ws.example.com",
    appId: "my-app",
    token: "jwt-token",
    databaseConfig: { type: "sqljs" },
  });

  // 1. Open all documents you'll be using
  const usersDoc = await client.documents.open("users-doc-123");
  const tasksDoc = await client.documents.open("tasks-doc-456");
  const generalDoc = await client.documents.open("general-doc-789");

  // 2. Set default document for unmapped models
  client.setDefaultDocumentId("general-doc-789");

  // 3. Map specific models to their documents
  client.addDocumentModelMapping("Contact", "users-doc-123");
  client.addDocumentModelMapping("Task", "tasks-doc-456");
  // Note has no mapping, so it will use the default document

  // 4. Now ORM queries route automatically:
  const contacts = await Contact.query(); // → users-doc-123
  const tasks = await Task.query(); // → tasks-doc-456
  const notes = await Note.query(); // → general-doc-789 (default)

  // 5. Verify current mappings
  const contactDocId = client.getDocumentModelMapping("Contact");
  console.log("Contact uses:", contactDocId); // 'users-doc-123'

  const defaultDocId = client.getDefaultDocumentId();
  console.log("Default doc:", defaultDocId); // 'general-doc-789'

  return { client, usersDoc, tasksDoc, generalDoc };
}

await setupModels();
```

### Updating Mappings

You can change mappings at runtime:

```typescript
// Switch Contact to a different document
await client.documents.open("contacts-v2-doc");
client.addDocumentModelMapping("Contact", "contacts-v2-doc");

// Clear a specific mapping (falls back to default document)
client.clearDocumentModelMapping("Contact");

// Change the default document
await client.documents.open("new-default-doc");
client.setDefaultDocumentId("new-default-doc");

// Clear the default (models without mappings will error)
client.clearDefaultDocumentId();
```

### Querying Current Configuration

```typescript
// Check what document a model is using
const taskDocId = client.getDocumentModelMapping("Task");
if (taskDocId) {
  console.log("Task model uses document:", taskDocId);
} else {
  console.log("Task model has no explicit mapping");
}

// Check the default document
const defaultId = client.getDefaultDocumentId();
if (defaultId) {
  console.log("Default document:", defaultId);
} else {
  console.log("No default document set");
}

// List all currently open documents
const openDocs = client.listOpenDocuments();
console.log("Open documents:", openDocs);
```

### Best Practices

1. **Open before mapping**: Always open documents before setting them as default or mapping models to them
2. **Set default first**: Establish a default document before adding specific mappings to avoid errors
3. **Organize by domain**: Group related models in the same document (e.g., all user-related models in one doc)
4. **Document lifecycle**: Clear mappings when closing documents to avoid stale references
5. **Multi-tenant apps**: Use different document mappings per tenant/workspace

### Error Handling

```typescript
try {
  // This will throw if the document isn't open
  client.setDefaultDocumentId("not-open-yet");
} catch (error) {
  console.error("Document must be open first");
}

try {
  // This will throw if no mapping or default exists
  await UnmappedModel.query();
} catch (error) {
  console.error("No document mapping for this model");
}
```

### Use Case: Workspace Switching

```typescript
async function switchWorkspace(workspaceId: string) {
  // Open the workspace's document
  const { doc } = await client.documents.open(workspaceId);

  // Update all model mappings to this workspace
  client.setDefaultDocumentId(workspaceId);
  client.addDocumentModelMapping("Task", workspaceId);
  client.addDocumentModelMapping("Note", workspaceId);
  client.addDocumentModelMapping("Contact", workspaceId);

  // All subsequent queries now use the new workspace's document
  const tasks = await Task.query(); // → reads from workspaceId
}
```

### Use Case: Per-Model Documents

```typescript
// Organize models by type across different documents
await Promise.all([
  client.documents.open("people-doc"),
  client.documents.open("projects-doc"),
  client.documents.open("calendar-doc"),
]);

// Set up routing
client.addDocumentModelMapping("Contact", "people-doc");
client.addDocumentModelMapping("Company", "people-doc");
client.addDocumentModelMapping("Project", "projects-doc");
client.addDocumentModelMapping("Task", "projects-doc");
client.addDocumentModelMapping("Event", "calendar-doc");
client.addDocumentModelMapping("Reminder", "calendar-doc");

// No default needed - all models are explicitly mapped
```

## Awareness (User Presence)

The JsBaoClient provides two awareness APIs. Use the DocumentsAPI methods for convenience:

```typescript
// Set your awareness state (cursor, selection, user info) - Convenience API
client.documents.setAwareness(documentId, {
  user: {
    name: "John Doe",
    email: "john@example.com",
    color: "#ff0000",
  },
  cursor: {
    line: 10,
    column: 5,
  },
  selection: {
    start: { line: 10, column: 5 },
    end: { line: 10, column: 12 },
  },
});

// Get all awareness states - Convenience API
const awarenessStates = client.documents.getAwarenessStates(documentId);
awarenessStates.forEach((state, clientId) => {
  console.log(`Client ${clientId}:`, state.user?.name, state.cursor);
});

// Advanced awareness API for more control
client.setLocalAwarenessState(documentId, {
  user: { name: "Jane Doe", color: "#00ff00" },
  cursor: { line: 5, column: 10 },
});

// Listen for awareness changes
client.on("awareness", ({ documentId, added, updated, removed }) => {
  console.log(`Awareness changed for ${documentId}`);
  console.log("Added clients:", added);
  console.log("Updated clients:", updated);
  console.log("Removed clients:", removed);
});
```

## User Profile and Session

```typescript
// Get current user profile
const profile = await client.me.get();
console.log("User:", profile.name, profile.email);
console.log("App role:", profile.appRole);
console.log("User ID:", profile.userId);
console.log("Avatar:", profile.avatarUrl);

// Update user profile (name and/or external avatar URL)
const updated = await client.me.update({
  name: "New Display Name",
});

// Set an external avatar URL
await client.me.update({
  avatarUrl: "https://example.com/my-avatar.png",
});

// Clear avatar URL
await client.me.update({
  avatarUrl: null,
});

// Upload avatar image (stored in R2, proxied through the API)
const imageBlob = await fetch("/path/to/image.png").then((r) => r.blob());
const { avatarUrl } = await client.me.uploadAvatar(imageBlob, "image/png");
console.log("New avatar URL:", avatarUrl);

// Upload from ArrayBuffer
const arrayBuffer = await file.arrayBuffer();
await client.me.uploadAvatar(arrayBuffer, "image/jpeg");

// Get session information
const session = await client.session.get();
console.log("Session ID:", session.sessionId);
console.log("Session expires:", session.expiresAt);
console.log("Last activity:", session.lastActivity);
```

## Error Handling

```typescript
try {
  // HTTP operations throw exceptions
  const res = await client.documents.create({ title: "Test" });
} catch (error) {
  if ((error as any).message?.includes("401")) {
    console.error("Authentication failed");
  } else if ((error as any).message?.includes("403")) {
    console.error("Permission denied");
  } else if ((error as any).code === "OFFLINE") {
    console.error("Client offline");
  } else {
    console.error("API error:", (error as any).message);
  }
}

// WebSocket errors are handled via events
client.on("connection-error", (error) => {
  console.error("WebSocket error:", error);
});

client.on("auth-failed", ({ message }) => {
  console.error("Auth failed:", message);
  // Refresh token or redirect to login
});
```

### Auth Error Codes

Authentication methods (OAuth, Magic Link, Passkey) throw `AuthError` with machine-readable codes for programmatic error handling:

```typescript
import { AuthError, AUTH_CODES } from "js-bao-wss-client";

// Available error codes:
// AUTH_CODES.ADDED_TO_WAITLIST      - User added to waitlist (invite-only app)
// AUTH_CODES.INVITATION_REQUIRED    - User needs invitation to access app
// AUTH_CODES.DOMAIN_NOT_ALLOWED     - User's email domain not in allowlist
// AUTH_CODES.INVALID_TOKEN          - Token is invalid or malformed
// AUTH_CODES.TOKEN_EXPIRED          - Token has expired
// AUTH_CODES.PASSKEY_NOT_ENABLED    - Passkey auth not enabled for app
// AUTH_CODES.MAGIC_LINK_NOT_ENABLED - Magic link auth not enabled for app
// AUTH_CODES.WAITLIST_ENTRY_UPDATED - Waitlist entry was updated (success code)

try {
  await client.handleOAuthCallback(code, state);
} catch (error) {
  if (error instanceof AuthError) {
    switch (error.code) {
      case AUTH_CODES.ADDED_TO_WAITLIST:
        showWaitlistMessage("You've been added to the waitlist.");
        break;
      case AUTH_CODES.INVITATION_REQUIRED:
        showError("You need an invitation to access this app.");
        break;
      case AUTH_CODES.DOMAIN_NOT_ALLOWED:
        showError("Your email domain is not allowed.");
        break;
      default:
        showError(error.message);
    }
  }
}

// Check error code without instanceof
if ((error as any).code === AUTH_CODES.ADDED_TO_WAITLIST) {
  // Handle waitlist case
}
```

The `AuthError` class extends `Error` with a `code` property containing the machine-readable error code. This enables reliable error handling without parsing error messages.

## Token Management

```typescript
// Refresh token when it expires
client.refreshToken("newJwtToken");

// Handle auth failures
client.on("auth-failed", async ({ message }) => {
  try {
    // Get new token from your auth system
    const newToken = await refreshAuthToken();
    client.refreshToken(newToken);
  } catch (error) {
    // Redirect to login page
    window.location.href = "/login";
  }
});

// Manual token management
client.setToken("new-jwt-token"); // Also calls refreshToken internally
const currentToken = client.getToken();
const isAuthenticated = client.isAuthenticated();
```

## Connection Management

```typescript
// Check connection status
if (client.isConnected()) {
  console.log("WebSocket is connected");
}

// Check document sync status
if (client.documents.isSynced(documentId)) {
  console.log("Document is synced");
}

// Manually control connection (returns Promise)
await client.setShouldConnect(false); // Disconnect
await client.setShouldConnect(true); // Reconnect

// Manual disconnect (returns Promise)
await client.disconnect();

// Clean up when done (closes all documents and connections)
await client.destroy();
```

## Logout, Offline Identity, and Offline Grant Discovery

The client provides a unified `logout` that clears the server refresh cookie (best-effort), shuts down networking, and resets in-memory auth. Apps can control how offline capability behaves post-logout.

```ts
await client.logout({
  redirectTo: "/login", // optional redirect
  wipeLocal: false, // if true, evict local document caches
  revokeOffline: false, // if true, delete the stored offline grant
  clearOfflineIdentity: true, // default true; if false, keep in-memory offlineIdentity
});
```

- If `clearOfflineIdentity` is `true` (default): the client clears the in-memory `offlineIdentity` during logout so the instance is not considered authenticated until the user explicitly unlocks offline.
- If `clearOfflineIdentity` is `false`: the client keeps the in-memory `offlineIdentity`. This can be desirable in apps that want the offline persona to remain available immediately after sign out.

Offline grant persistence and discovery:

- Enabling or unlocking offline stores a signed grant in a user-scoped IndexedDB database named `js-bao:offline:{appId}:{userId}`.
- The client remembers the last offline-capable user id in `localStorage` under `js-bao:last-user:{appId}`.
- `hasOfflineGrantStored()` detects grants even after logout by discovering the last user via `localStorage` or (when available) enumerating `indexedDB.databases()`.

## Client-managed Auth Orchestration

New client options:

```ts
const client = await initializeClient({
  // ...
  autoOAuth: true, // auto-start OAuth if still unauthenticated
  oauthRedirectUri, // required when autoOAuth is true
  suppressAutoLoginMs: 5000, // suppress silent refresh/OAuth for ~5s after logout
  autoUnlockOfflineOnInit: true, // when offline and a grant exists, unlock at startup
  databaseConfig: { type: "sqljs" },
});
```

Behavior at startup (when no token):

- If `autoUnlockOfflineOnInit` and device is offline and a grant exists, the client unlocks offline, opens user-scoped IndexedDB (metadata + offline), and emits `offlineAuth:unlocked`.
- Otherwise, if not within `suppressAutoLoginMs`, the client attempts a silent cookie refresh to mint a JWT.
- If still unauthenticated and `autoOAuth` is true, the client auto-starts OAuth.

Ongoing refresh:

- The client proactively refreshes tokens before expiry and retries once on `401` before emitting `auth-failed`.

Apps should subscribe to events (`auth-success`, `auth-failed`, `offlineAuth:unlocked`) to mirror session state into their UI/store.

## Complete Example: Collaborative Text Editor

```typescript
import { JsBaoClient, initializeClient } from "js-bao-wss-client";
import * as Y from "yjs";

class CollaborativeEditor {
  private client!: JsBaoClient;
  private ydoc: Y.Doc | null = null;
  private ytext: Y.Text | null = null;

  static async create(
    apiUrl: string,
    wsUrl: string,
    appId: string,
    token?: string
  ): Promise<CollaborativeEditor> {
    const client = await initializeClient({
      apiUrl,
      wsUrl,
      appId,
      token,
      databaseConfig: { type: "sqljs" },
      autoOAuth: !token,
      oauthRedirectUri: window.location.origin + "/oauth/callback",
    });
    const editor = new CollaborativeEditor();
    editor.client = client;
    editor.setupEventListeners();
    return editor;
  }

  private constructor() {}

  private setupEventListeners() {
    // Connection status
    this.client.on("status", ({ status }) => {
      this.updateConnectionUI(status);
    });

    // Document sync
    this.client.on("sync", ({ documentId, synced }) => {
      this.updateSyncUI(synced);
    });

    // User awareness
    this.client.on("awareness", ({ documentId, added, updated, removed }) => {
      this.updateCursors(added, updated, removed);
    });

    // Auth events
    this.client.on("auth-failed", () => {
      this.handleAuthFailure();
    });
  }

  async createDocument(title: string) {
    const { metadata } = await this.client.documents.create({ title });
    return metadata.documentId;
  }

  async openDocument(documentId: string) {
    // Open for real-time editing
    const { doc } = await this.client.documents.open(documentId, {
      waitForLoad: "localIfAvailableElseNetwork",
      enableNetworkSync: true,
    });
    this.ydoc = doc as Y.Doc;
    this.ytext = this.ydoc.getText("content");

    // Listen for text changes
    this.ytext.observe((event) => {
      this.updateEditorContent();
    });

    // Set initial awareness
    this.client.documents.setAwareness(documentId, {
      user: { name: "Current User", color: "#0066cc" },
      cursor: { line: 0, column: 0 },
    });

    // Check if read-only
    if (this.client.documents.isReadOnly(documentId)) {
      this.setEditorReadOnly(true);
    }

    return this.ytext;
  }

  insertText(index: number, text: string, formatting?: any) {
    if (
      this.ytext &&
      !this.client.documents.isReadOnly(this.getCurrentDocumentId())
    ) {
      this.ytext.insert(index, text, formatting);
    }
  }

  deleteText(index: number, length: number) {
    if (
      this.ytext &&
      !this.client.documents.isReadOnly(this.getCurrentDocumentId())
    ) {
      this.ytext.delete(index, length);
    }
  }

  updateCursor(line: number, column: number, documentId: string) {
    this.client.documents.setAwareness(documentId, {
      user: { name: "Current User", color: "#0066cc" },
      cursor: { line, column },
    });
  }

  async inviteUser(
    documentId: string,
    email: string,
    permission: "read-write" | "reader"
  ) {
    try {
      const invitation = await this.client.documents.createInvitation(
        documentId,
        email,
        permission
      );
      console.log("Invitation sent:", invitation.invitationId);
      return invitation;
    } catch (error) {
      console.error("Failed to invite user:", error);
      throw error;
    }
  }

  private updateConnectionUI(status: string) {
    // Update your UI to show connection status
    console.log("Connection:", status);
  }

  private updateSyncUI(synced: boolean) {
    // Update your UI to show sync status
    console.log("Synced:", synced);
  }

  private updateCursors(added: string[], updated: string[], removed: string[]) {
    // Update cursor display in your editor
    console.log("Cursors changed:", { added, updated, removed });
  }

  private updateEditorContent() {
    // Update your editor's display
    if (this.ytext) {
      const content = this.ytext.toString();
      console.log("Content updated:", content);
    }
  }

  private setEditorReadOnly(readOnly: boolean) {
    // Set your editor to read-only mode
    console.log("Editor read-only:", readOnly);
  }

  private handleAuthFailure() {
    // Handle authentication failure
    if (this.client.checkOAuthAvailable()) {
      this.client.startOAuthFlow();
    } else {
      // Redirect to custom login
      window.location.href = "/login";
    }
  }

  private getCurrentDocumentId(): string {
    // Return current document ID
    return "current-doc-id";
  }

  async closeDocument(documentId: string) {
    this.client.documents.close(documentId);
    this.ydoc = null;
    this.ytext = null;
  }

  async destroy() {
    await this.client.destroy();
  }
}

// Usage
const editor = new CollaborativeEditor(
  "https://api.example.com",
  "wss://ws.example.com",
  "my-app-id",
  "optional-jwt-token" // Omit for OAuth flow
);

// Create and open a document
const documentId = await editor.createDocument("My Collaborative Doc");
const ytext = await editor.openDocument(documentId);

// Make some edits
editor.insertText(0, "Hello, collaborative world!");

// Invite a user
await editor.inviteUser(documentId, "colleague@example.com", "read-write");
```

## Best Practices

1. **Always handle auth failures**: Set up proper token refresh logic or OAuth flow
2. **Listen for sync events**: Don't assume documents are immediately synced
3. **Clean up resources**: Call `documents.close()` on documents and `destroy()` on client
4. **Use awareness wisely**: Update cursor/selection frequently but throttle updates
5. **Handle network issues**: The client auto-reconnects, but update your UI accordingly
6. **Batch operations**: Use batch permission updates when possible
7. **Check permissions**: Use `validateAccess()` and `isReadOnly()` before making changes
8. **Use invitations**: Invite users via email instead of requiring user IDs

## TypeScript Support

The library is written in TypeScript and provides full type definitions for all APIs, events, and data structures.

## Local Development & Testing

For contributors and developers working on this package:

### Testing Locally

See [LOCAL_TESTING.md](_media/LOCAL_TESTING.md) for a comprehensive guide on testing your changes locally using `npm pack`.

**Quick test:**

```bash
pnpm run build && pnpm pack
cd ../../../ && mkdir test-package && cd test-package
npm init -y && npm install ../js-bao-wss/src/client/js-bao-wss-client-1.0.0.tgz
echo 'import {JsBaoClient} from "js-bao-wss-client"; console.log("✅ Works!")' > test.js
sed -i '' 's/"type": "commonjs"/"type": "module"/' package.json && node test.js
```

### Running Built-in Tests

```bash
cd tests
pnpm install
pnpm run test:esm     # Test ESM imports
pnpm run test:umd     # Instructions for UMD testing
```

### Build Commands

```bash
pnpm run build        # Build both ESM and UMD
pnpm run build:esm    # Build ESM only
pnpm run build:umd    # Build UMD only
pnpm pack             # Create publishable package
```

## Internal Architecture

### OfflineStore Storage Initialization

The `OfflineStore` class handles all persistent storage operations (metadata, grants, analytics, JWT persistence). It uses a lazy initialization pattern where storage is only created when first needed.

**Key methods:**

- `ensureInitialized(ctx: MetadataContext)` - For user-scoped data (metadata, grants, analytics). Requires `ctx.userId`. Calls `storageProvider.init(userId)` to namespace storage by user.
- `ensureAuthInitialized(ctx: AuthTokenContext)` - For auth data (JWT persistence). Does NOT require userId since we need to load persisted JWTs before knowing who the user is. Uses namespace like `auth:${appId}:${namespace}`.

Both methods call `ensureStorage()` internally, which invokes the storage initializer provided by JsBaoClient to create the storage provider.

**Rule for writing new OfflineStore methods:**

Every public method that accesses storage must follow this pattern:

```typescript
async newStorageMethod(ctx: MetadataContext, ...): Promise<...> {
  // 1. Early exit for missing required context (before async work)
  if (!ctx.userId) return ...;

  // 2. Ensure storage is initialized for this context
  await this.ensureInitialized(ctx);  // or ensureAuthInitialized for auth methods

  // 3. Check if storage is actually available (initialization might have failed)
  if (!this.storageProvider || !this.storageProvider.isReady()) return ...;

  // 4. Do the actual storage operation
  await this.storageProvider.get/put/delete(...);
}
```

**Important:** The `ensure*` call must come BEFORE the `!this.storageProvider` check, otherwise the method will return early without ever initializing storage.

This pattern is internal to OfflineStore. Code outside OfflineStore (like JsBaoClient) doesn't need to think about initialization - just call the public OfflineStore methods and they handle it internally.
