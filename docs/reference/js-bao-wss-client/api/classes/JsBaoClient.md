[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / JsBaoClient

# Class: JsBaoClient

JsBaoClient - Multi-tenant client for js-bao-wss

Provides a hierarchical API for:
- HTTP operations: document management, permissions, user profile, session
- Real-time operations: multiplexed Y.Doc updates over WebSocket
- Awareness: collaborative presence state

## Extends

- `Observable`\<`any`\>

## Documents

### addDocumentModelMapping()

> **addDocumentModelMapping**(`modelName`, `documentId`): `void`

Map a js-bao model name to a specific document ID.

#### Parameters

##### modelName

`string`

The model class name to map

##### documentId

`string`

The document that should store instances of this model

#### Returns

`void`

***

### cancelPendingCreate()

> **cancelPendingCreate**(`documentId`, `opts?`): `Promise`\<`void`\>

Cancel a pending offline document creation.

#### Parameters

##### documentId

`string`

The pending document to cancel

##### opts?

Optional cleanup behavior

###### evictLocal?

`boolean`

If true, also removes the document's local data from storage

#### Returns

`Promise`\<`void`\>

***

### clearDefaultDocumentId()

> **clearDefaultDocumentId**(): `void`

Clear the default document ID.

#### Returns

`void`

***

### clearDocumentModelMapping()

> **clearDocumentModelMapping**(`modelName`): `void`

Remove a model-to-document mapping.

#### Parameters

##### modelName

`string`

The model class name to unmap

#### Returns

`void`

***

### clearSelfRemovalPending()

> **clearSelfRemovalPending**(`documentId`): `void`

Clear the self-removal pending flag for a document.

#### Parameters

##### documentId

`string`

The document to clear the pending self-removal flag for

#### Returns

`void`

***

### closeDocument()

> **closeDocument**(`documentId`, `options?`): `Promise`\<\{ `evicted`: `boolean`; \}\>

Close an open document and stop syncing.

#### Parameters

##### documentId

`string`

The document to close

##### options?

Optional close behavior

###### evictLocal?

`boolean`

If true, removes the document's local data from storage on close

#### Returns

`Promise`\<\{ `evicted`: `boolean`; \}\>

***

### commitOfflineCreate()

> **commitOfflineCreate**(`documentId`, `opts?`): `Promise`\<\{ `created`: `boolean`; `linked?`: `boolean`; `reason?`: `string`; \}\>

Commit a locally created document to the server.

#### Parameters

##### documentId

`string`

The locally created document to commit

##### opts?

Optional commit behavior

###### onExists?

`"link"` \| `"fail"`

What to do if the document already exists on the server: "link" adopts the existing document, "fail" throws an error

#### Returns

`Promise`\<\{ `created`: `boolean`; `linked?`: `boolean`; `reason?`: `string`; \}\>

***

### createDocument()

> **createDocument**(`options`): `Promise`\<\{ `metadata`: `any`; \}\>

Create a new document, optionally local-only for offline-first creation.

#### Parameters

##### options

`CreateDocumentOptions`

Document creation options

#### Returns

`Promise`\<\{ `metadata`: `any`; \}\>

***

### document()

> **document**(`documentId`): [`DocumentContext`](../interfaces/DocumentContext.md)

Get a scoped API for a specific document

#### Parameters

##### documentId

`string`

The document to scope operations to

#### Returns

[`DocumentContext`](../interfaces/DocumentContext.md)

***

### getDefaultDocumentId()

> **getDefaultDocumentId**(): `string` \| `null`

Get the current default document ID.

#### Returns

`string` \| `null`

***

### getDoc()

> **getDoc**(`documentId`): `Doc` \| `undefined`

Get the raw Yjs Doc instance for a document.

#### Parameters

##### documentId

`string`

The document to retrieve

#### Returns

`Doc` \| `undefined`

***

### getDocDebug()

> **getDocDebug**(`documentId`): `DocumentDebugSnapshot`

Get debug information about a document's internal state.

#### Parameters

##### documentId

`string`

The document to inspect

#### Returns

`DocumentDebugSnapshot`

***

### getDocHash()

> **getDocHash**(`documentId`): `Promise`\<`string`\>

Compute a hash of the document's current state.

#### Parameters

##### documentId

`string`

The document to hash

#### Returns

`Promise`\<`string`\>

***

### getDocumentModelMapping()

> **getDocumentModelMapping**(`modelName`): `string` \| `null`

Get the document ID mapped to a model name.

#### Parameters

##### modelName

`string`

The model class name to look up

#### Returns

`string` \| `null`

***

### getDocumentPermission()

> **getDocumentPermission**(`documentId`): `DocumentPermission` \| `null`

Get the current user's permission level for a document.

#### Parameters

##### documentId

`string`

The document to check permissions for

#### Returns

`DocumentPermission` \| `null`

***

### isDocOpen()

> **isDocOpen**(`documentId`): `boolean`

Check if a document is currently open.

#### Parameters

##### documentId

`string`

The document to check

#### Returns

`boolean`

***

### isDocumentReadOnly()

> **isDocumentReadOnly**(`documentId`): `boolean`

Check if the current user has read-only access to a document.

#### Parameters

##### documentId

`string`

The document to check

#### Returns

`boolean`

***

### isMetadataDeleted()

> **isMetadataDeleted**(`documentId`): `boolean`

Check if a document's metadata has been marked as deleted.

#### Parameters

##### documentId

`string`

The document to check

#### Returns

`boolean`

***

### isPendingCreate()

> **isPendingCreate**(`documentId`): `boolean`

Check if a document is pending server creation.

#### Parameters

##### documentId

`string`

The document to check

#### Returns

`boolean`

***

### isRootDocument()

> **isRootDocument**(`documentId`): `boolean`

Check if a document is the user's root document.

#### Parameters

##### documentId

`string`

The document to check

#### Returns

`boolean`

***

### listOpenDocuments()

> **listOpenDocuments**(): `string`[]

List IDs of all currently open documents.

#### Returns

`string`[]

***

### listPendingCreates()

> **listPendingCreates**(): `Promise`\<`object`[]\>

List all documents pending server creation.

#### Returns

`Promise`\<`object`[]\>

***

### markMetadataDeleted()

> **markMetadataDeleted**(`documentId`): `number` \| `undefined`

Mark a document's metadata as deleted locally.

#### Parameters

##### documentId

`string`

The document to mark as deleted

#### Returns

`number` \| `undefined`

***

### markSelfRemovalPending()

> **markSelfRemovalPending**(`documentId`): `void`

Mark a document as pending self-removal to suppress duplicate server delete events.

#### Parameters

##### documentId

`string`

The document being removed by the current user

#### Returns

`void`

***

### openDocument()

> **openDocument**(`documentId`, `options?`): `Promise`\<`Doc`\>

Open a document for real-time collaboration and sync.

#### Parameters

##### documentId

`string`

The document to open

##### options?

Controls how the document is loaded and synced

###### availabilityWaitMs?

`number`

How long to wait for initial data before resolving with an empty doc (ms, default 30000)

###### deferNetworkSync?

`boolean`

If true, opens locally without starting server sync until startNetworkSync() is called

###### enableNetworkSync?

`boolean`

If false, opens the document without subscribing to server updates (default true)

###### requestSyncPerf?

`boolean`

If true, requests sync performance timings from the server

###### retainLocal?

`boolean`

If true, persists the document data locally for offline access (default true)

###### waitForLoad?

`"local"` \| `"network"` \| `"localIfAvailableElseNetwork"`

Controls when the returned promise resolves: "local" for local data only, "network" to wait for server sync, "localIfAvailableElseNetwork" to prefer local but fall back to network

#### Returns

`Promise`\<`Doc`\>

***

### openDocumentByAlias()

> **openDocumentByAlias**(`alias`, `options?`): `Promise`\<\{ `doc`: `Doc`; `metadata`: `LocalMetadataEntry` \| `null`; \}\>

Resolve a document alias and open the document.

#### Parameters

##### alias

`ResolveAliasParams`

Alias parameters identifying the document (scope, aliasKey, optional userId)

##### options?

Controls how the resolved document is loaded and synced

###### availabilityWaitMs?

`number`

How long to wait for initial data before resolving with an empty doc (ms)

###### enableNetworkSync?

`boolean`

If false, opens the document without subscribing to server updates

###### retainLocal?

`boolean`

If true, persists the document data locally for offline access

###### waitForLoad?

`"local"` \| `"network"` \| `"localIfAvailableElseNetwork"`

Controls when the returned promise resolves: "local", "network", or "localIfAvailableElseNetwork"

#### Returns

`Promise`\<\{ `doc`: `Doc`; `metadata`: `LocalMetadataEntry` \| `null`; \}\>

***

### retryCommit()

> **retryCommit**(`documentId`): `Promise`\<\{ `created`: `boolean`; \} \| `null`\>

Retry committing a pending offline-created document to the server.

#### Parameters

##### documentId

`string`

The pending document to retry committing

#### Returns

`Promise`\<\{ `created`: `boolean`; \} \| `null`\>

***

### runLocalTransaction()

> **runLocalTransaction**(`documentId`, `fn`): `void`

Run a function as a local Yjs transaction (batches updates).

#### Parameters

##### documentId

`string`

The document to transact against

##### fn

() => `void`

Function to execute within the transaction; all Yjs mutations inside are batched into a single update

#### Returns

`void`

***

### setDefaultDocumentId()

> **setDefaultDocumentId**(`documentId`): `void`

Set the default document ID used by js-bao models when no explicit mapping exists.

#### Parameters

##### documentId

`string`

The document to use as the default for all unmapped models

#### Returns

`void`

***

### updateLocalMetadata()

> **updateLocalMetadata**(`documentId`, `updates`): `Promise`\<`void`\>

Update a document's locally stored metadata (title, tags).

#### Parameters

##### documentId

`string`

The document to update metadata for

##### updates

Fields to update in the local metadata cache

###### tags?

`string`[]

New document tags

###### title?

`string`

New document title

#### Returns

`Promise`\<`void`\>

## Constructors

### Constructor

> **new JsBaoClient**(`options`): `JsBaoClient`

#### Parameters

##### options

[`JsBaoClientOptions`](../interfaces/JsBaoClientOptions.md)

#### Returns

`JsBaoClient`

#### Overrides

`Observable<any>.constructor`

## Methods

### checkStateVector()

> **checkStateVector**(`documentId`, `timeoutMs`): `Promise`\<\{ `includesWrites`: `boolean`; `inSync`: `boolean`; \}\>

Ask the server to compare its state vector with the client's for a document.
Returns { includesWrites, inSync } or safe defaults on failure/timeout.

#### Parameters

##### documentId

`string`

##### timeoutMs

`number` = `5000`

#### Returns

`Promise`\<\{ `includesWrites`: `boolean`; `inSync`: `boolean`; \}\>

***

### once()

> **once**(`name`, `f`): `void`

#### Parameters

##### name

`any`

##### f

`Function`

#### Returns

`void`

#### Inherited from

`Observable.once`

***

### ~~waitForSync()~~

> **waitForSync**(`documentId`, `timeoutMs`): `Promise`\<`void`\>

#### Parameters

##### documentId

`string`

##### timeoutMs

`number` = `30000`

#### Returns

`Promise`\<`void`\>

#### Deprecated

Use [waitForInitialSync](#waitforinitialsync) instead.

## Authentication

### checkOAuthAvailable()

> **checkOAuthAvailable**(): `Promise`\<`boolean`\>

Check if OAuth authentication is available for this app.

#### Returns

`Promise`\<`boolean`\>

***

### getAppConfig()

> **getAppConfig**(): `Promise`\<\{ `appId`: `string`; `hasOAuth`: `boolean`; `hasPasskey`: `boolean`; `magicLinkEnabled`: `boolean`; `mode`: `"public"` \| `"invite-only"` \| `"domain"`; `name`: `string`; `waitlistEnabled`: `boolean`; \}\>

Get the app's authentication configuration.
Useful for checking what auth methods are available before showing login UI.

#### Returns

`Promise`\<\{ `appId`: `string`; `hasOAuth`: `boolean`; `hasPasskey`: `boolean`; `magicLinkEnabled`: `boolean`; `mode`: `"public"` \| `"invite-only"` \| `"domain"`; `name`: `string`; `waitlistEnabled`: `boolean`; \}\>

***

### getAuthConfig()

> **getAuthConfig**(): `Promise`\<\{ `appId`: `string`; `googleClientId`: `string` \| `null`; `googleOAuthEnabled`: `boolean`; `hasOAuth`: `boolean`; `hasPasskey`: `boolean`; `magicLinkEnabled`: `boolean`; `mode`: `string`; `name`: `string`; `otpEnabled`: `boolean`; `passkeyEnabled`: `boolean`; `passkeyRpId`: `string` \| `null`; `passkeyRpName`: `string` \| `null`; `redirectUris`: `string`[] \| `null`; `waitlistEnabled`: `boolean`; \}\>

Get detailed authentication configuration including enabled providers and passkey settings.

#### Returns

`Promise`\<\{ `appId`: `string`; `googleClientId`: `string` \| `null`; `googleOAuthEnabled`: `boolean`; `hasOAuth`: `boolean`; `hasPasskey`: `boolean`; `magicLinkEnabled`: `boolean`; `mode`: `string`; `name`: `string`; `otpEnabled`: `boolean`; `passkeyEnabled`: `boolean`; `passkeyRpId`: `string` \| `null`; `passkeyRpName`: `string` \| `null`; `redirectUris`: `string`[] \| `null`; `waitlistEnabled`: `boolean`; \}\>

***

### getAuthPersistenceInfo()

> **getAuthPersistenceInfo**(): `object`

Get info about how auth tokens are persisted (memory vs storage).

#### Returns

`object`

Object with persistence `mode` ("memory" or "persisted") and whether the stored token has been `hydrated`

##### hydrated

> **hydrated**: `boolean`

##### mode

> **mode**: `"memory"` \| `"persisted"`

***

### getAuthState()

> **getAuthState**(): `object`

Get the current authentication state including mode (online/offline/none) and user ID.

#### Returns

`object`

Object with `authenticated` flag, current auth `mode`, and optional `userId`

##### authenticated

> **authenticated**: `boolean`

##### mode

> **mode**: `"none"` \| `"online"` \| `"offline"`

##### userId?

> `optional` **userId**: `string`

***

### getRootDocId()

> **getRootDocId**(): `string` \| `null`

Get the root document ID for the authenticated user.

#### Returns

`string` \| `null`

***

### getToken()

> **getToken**(): `string` \| `null`

Get the current JWT auth token.

#### Returns

`string` \| `null`

***

### getUserId()

> **getUserId**(): `string` \| `null`

Get the current authenticated user's ID.

#### Returns

`string` \| `null`

***

### handleOAuthCallback()

> **handleOAuthCallback**(`code`, `state`): `Promise`\<`void`\>

Handle the OAuth callback after the user completes the OAuth flow.

#### Parameters

##### code

`string`

The authorization code from the OAuth provider

##### state

`string`

The state parameter for CSRF verification

#### Returns

`Promise`\<`void`\>

***

### isAuthenticated()

> **isAuthenticated**(): `boolean`

Check if the client is currently authenticated.

#### Returns

`boolean`

***

### logout()

> **logout**(`options?`): `Promise`\<`void`\>

Logout: best-effort server cookie clear, shutdown networking, clear auth state, and optional local eviction.
- Preserves stored offline grant by default (does not delete it)
- Clears in-memory offline identity so the client is not considered authenticated

#### Parameters

##### options?

[`LogoutOptions`](../interfaces/LogoutOptions.md)

Controls logout behavior

#### Returns

`Promise`\<`void`\>

***

### magicLinkRequest()

> **magicLinkRequest**(`email`, `options?`): `Promise`\<\{ `success`: `boolean`; \}\>

Request a magic link email for passwordless authentication.

#### Parameters

##### email

`string`

The email address to send the magic link to

##### options?

Optional configuration

###### redirectUri?

`string`

Override the default OAuth redirect URI for the magic link callback

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### magicLinkVerify()

> **magicLinkVerify**(`token`): `Promise`\<\{ `isNewUser?`: `boolean`; `promptAddPasskey?`: `boolean`; `user`: \{ `email`: `string`; `name?`: `string`; `userId`: `string`; \}; \}\>

Verify a magic link token and authenticate the user.

#### Parameters

##### token

`string`

The magic link token from the email URL

#### Returns

`Promise`\<\{ `isNewUser?`: `boolean`; `promptAddPasskey?`: `boolean`; `user`: \{ `email`: `string`; `name?`: `string`; `userId`: `string`; \}; \}\>

***

### otpRequest()

> **otpRequest**(`email`): `Promise`\<\{ `success`: `boolean`; \}\>

Request a one-time password (OTP) code to be sent to the specified email.
The code can be verified using `otpVerify()`.

#### Parameters

##### email

`string`

The email address to send the OTP code to

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### otpVerify()

> **otpVerify**(`email`, `code`): `Promise`\<\{ `isNewUser?`: `boolean`; `user`: \{ `email`: `string`; `name?`: `string`; `userId`: `string`; \}; \}\>

Verify a one-time password (OTP) code and authenticate the user.
On success, the client will be authenticated and connected.

#### Parameters

##### email

`string`

The email address the OTP was sent to

##### code

`string`

The OTP code entered by the user

#### Returns

`Promise`\<\{ `isNewUser?`: `boolean`; `user`: \{ `email`: `string`; `name?`: `string`; `userId`: `string`; \}; \}\>

***

### passkeyAuthFinish()

> **passkeyAuthFinish**(`credential`, `challengeToken`): `Promise`\<\{ `isNewUser?`: `boolean`; `user`: \{ `email`: `string`; `name?`: `string`; `userId`: `string`; \}; \}\>

Complete passkey authentication with the browser's credential response.

#### Parameters

##### credential

`any`

The credential response from the browser's WebAuthn API

##### challengeToken

`string`

The challenge token returned by passkeyAuthStart()

#### Returns

`Promise`\<\{ `isNewUser?`: `boolean`; `user`: \{ `email`: `string`; `name?`: `string`; `userId`: `string`; \}; \}\>

***

### passkeyAuthStart()

> **passkeyAuthStart**(): `Promise`\<\{ `challengeToken`: `string`; `options`: `any`; \}\>

Start the passkey authentication flow, returns challenge options for the browser.

#### Returns

`Promise`\<\{ `challengeToken`: `string`; `options`: `any`; \}\>

***

### passkeyDelete()

> **passkeyDelete**(`passkeyId`): `Promise`\<\{ `success`: `boolean`; \}\>

Delete a registered passkey by ID.

#### Parameters

##### passkeyId

`string`

The ID of the passkey to delete

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### passkeyList()

> **passkeyList**(): `Promise`\<\{ `passkeys`: `object`[]; \}\>

List all passkeys registered for the current user.

#### Returns

`Promise`\<\{ `passkeys`: `object`[]; \}\>

***

### passkeyRegisterFinish()

> **passkeyRegisterFinish**(`credential`, `challengeToken`, `deviceName?`): `Promise`\<\{ `success`: `boolean`; \}\>

Complete passkey registration with the browser's credential response.

#### Parameters

##### credential

`any`

The credential response from the browser's WebAuthn API

##### challengeToken

`string`

The challenge token returned by passkeyRegisterStart()

##### deviceName?

`string`

Optional human-readable name for this passkey (e.g. "MacBook Pro")

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### passkeyRegisterStart()

> **passkeyRegisterStart**(): `Promise`\<\{ `challengeToken`: `string`; `options`: `any`; \}\>

Start registering a new passkey for the current user.

#### Returns

`Promise`\<\{ `challengeToken`: `string`; `options`: `any`; \}\>

***

### passkeyUpdate()

> **passkeyUpdate**(`passkeyId`, `params`): `Promise`\<\{ `passkey`: \{ `createdAt`: `string`; `deviceName`: `string`; `lastUsedAt?`: `string`; `passkeyId`: `string`; \}; \}\>

Update a passkey's metadata such as its device name.

#### Parameters

##### passkeyId

`string`

The ID of the passkey to update

##### params

Fields to update

###### deviceName

`string`

New human-readable name for the passkey

#### Returns

`Promise`\<\{ `passkey`: \{ `createdAt`: `string`; `deviceName`: `string`; `lastUsedAt?`: `string`; `passkeyId`: `string`; \}; \}\>

***

### setToken()

> **setToken**(`token`, `options?`): `void`

Manually set the JWT auth token.

#### Parameters

##### token

The JWT token to use for authentication, or null to clear

`string` | `null`

##### options?

Optional metadata

###### cause?

`string`

Reason for the token change (used in event payloads and logging)

#### Returns

`void`

***

### startOAuthFlow()

> **startOAuthFlow**(`continueUrl?`, `options?`): `Promise`\<`void`\>

Start the OAuth authentication flow by redirecting to the OAuth provider.

#### Parameters

##### continueUrl?

`string`

URL to return to after the OAuth flow completes

##### options?

Additional flow options

###### waitlist?

\{ `note?`: `string` \| `null`; `source?`: `string` \| `null`; \}

If provided, enrolls the user in the app's waitlist with optional source and note

###### waitlist.note?

`string` \| `null`

###### waitlist.source?

`string` \| `null`

#### Returns

`Promise`\<`void`\>

***

### waitForAuthBootstrap()

> **waitForAuthBootstrap**(): `Promise`\<`void`\>

Wait for the initial authentication bootstrap to complete (token refresh, offline unlock, etc.).

#### Returns

`Promise`\<`void`\>

***

### waitForAuthReady()

> **waitForAuthReady**(`options?`): `Promise`\<\{ `mode`: `"online"` \| `"offline"`; `userId`: `string`; \}\>

Wait until the client is authenticated and return the auth mode and user ID.

#### Parameters

##### options?

[`WaitForAuthReadyOptions`](../interfaces/WaitForAuthReadyOptions.md)

Optional configuration

#### Returns

`Promise`\<\{ `mode`: `"online"` \| `"offline"`; `userId`: `string`; \}\>

The authenticated `userId` and auth `mode` ("online" or "offline")

***

### waitForUserId()

> **waitForUserId**(`options?`): `Promise`\<`string`\>

Wait until a user ID is available (authenticated).

#### Parameters

##### options?

[`WaitForUserIdOptions`](../interfaces/WaitForUserIdOptions.md)

Optional configuration

#### Returns

`Promise`\<`string`\>

***

### exchangeOAuthCode()

> `static` **exchangeOAuthCode**(`params`): `Promise`\<`string`\>

Exchange an OAuth authorization code for an access token without constructing a client instance.

#### Parameters

##### params

OAuth exchange parameters

###### apiUrl

`string`

The API server base URL

###### appId

`string`

The application ID

###### code

`string`

The authorization code received from the OAuth provider

###### refreshProxyBaseUrl?

`string` \| `null`

Optional proxy URL for refresh token cookie handling

###### refreshProxyCookieMaxAgeSeconds?

`number`

Max age in seconds for the refresh proxy cookie

###### state

`string`

The state parameter for CSRF verification

#### Returns

`Promise`\<`string`\>

## Awareness

### getAwarenessStates()

> **getAwarenessStates**(`documentId`): `Map`\<`string`, `any`\>

Get all users' awareness states for a document.

#### Parameters

##### documentId

`string`

The document to get awareness states for

#### Returns

`Map`\<`string`, `any`\>

***

### getLocalAwarenessState()

> **getLocalAwarenessState**(`documentId`): `any`

Get the local user's current awareness state for a document.

#### Parameters

##### documentId

`string`

The document to get local awareness for

#### Returns

`any`

***

### removeAwareness()

> **removeAwareness**(`documentId`, `clientIds`, `_reason?`): `void`

Remove awareness states for specific clients.

#### Parameters

##### documentId

`string`

The document to remove awareness from

##### clientIds

`string`[]

Array of client IDs whose awareness states should be removed

##### \_reason?

`string`

Optional reason for removal (used for logging)

#### Returns

`void`

***

### removeAwarenessStates()

> **removeAwarenessStates**(`documentId`, `clientIds`, `_reason?`): `void`

Remove awareness states for specific clients and broadcast the removal to the server.

#### Parameters

##### documentId

`string`

The document to remove awareness from

##### clientIds

`string`[]

Array of client IDs whose awareness states should be removed

##### \_reason?

`string`

Optional reason for removal (used for logging)

#### Returns

`void`

***

### setAwareness()

> **setAwareness**(`documentId`, `state`): `void`

Set the local user's awareness state for a document (e.g., cursor position, selection).

#### Parameters

##### documentId

`string`

The document to set awareness for

##### state

`any`

Arbitrary awareness data (cursor, selection, user info) to broadcast to collaborators

#### Returns

`void`

***

### setLocalAwarenessState()

> **setLocalAwarenessState**(`documentId`, `state`): `void`

Set the local awareness state for a document.

#### Parameters

##### documentId

`string`

The document to set awareness for

##### state

`any`

Arbitrary awareness data (cursor, selection, user info) to broadcast to collaborators

#### Returns

`void`

## Blobs

### getBlobManager()

> **getBlobManager**(): `BlobManager`

Get the blob manager for direct blob operations.

#### Returns

`BlobManager`

***

### getBlobUploadConcurrency()

> **getBlobUploadConcurrency**(): `number`

Get the current blob upload concurrency limit.

#### Returns

`number`

***

### setBlobUploadConcurrency()

> **setBlobUploadConcurrency**(`value`): `void`

Set the maximum number of concurrent blob uploads.

#### Parameters

##### value

`number`

Maximum number of blob uploads that can run in parallel

#### Returns

`void`

## Configuration

### getApiUrl()

> **getApiUrl**(): `string`

Get the API base URL.

#### Returns

`string`

***

### getAppId()

> **getAppId**(): `string`

Get the app ID.

#### Returns

`string`

***

### getGeminiAnalyticsContext()

> **getGeminiAnalyticsContext**(): \{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

Get the analytics context for Gemini operations.

#### Returns

\{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

***

### getGlobalAdminAppId()

> **getGlobalAdminAppId**(): `string`

Get the global admin app ID.

#### Returns

`string`

***

### getLlmAnalyticsContext()

> **getLlmAnalyticsContext**(): \{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

Get the analytics context for LLM operations.

#### Returns

\{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

***

### setLogLevel()

> **setLogLevel**(`level`): `void`

Set the client's log verbosity level.

#### Parameters

##### level

`LogLevel`

The minimum log level to output (e.g. "debug", "warn", "error")

#### Returns

`void`

## Connection

### connect()

> **connect**(): `void`

Connect to the WebSocket server.

#### Returns

`void`

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Destroy the client, disconnecting and cleaning up all resources.

#### Returns

`Promise`\<`void`\>

#### Overrides

`Observable.destroy`

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Disconnect from the WebSocket server.

#### Returns

`Promise`\<`void`\>

***

### forceReconnect()

> **forceReconnect**(): `void`

Force a WebSocket reconnection.

#### Returns

`void`

***

### getConnectionId()

> **getConnectionId**(): `string`

Get the unique ID for this client connection.

#### Returns

`string`

***

### isConnected()

> **isConnected**(): `boolean`

Check if the WebSocket is currently connected.

#### Returns

`boolean`

***

### makeRequest()

> **makeRequest**(`method`, `path`, `data?`, `options?`): `Promise`\<`any`\>

Make an authenticated HTTP request to the API server.

#### Parameters

##### method

`string`

HTTP method (GET, POST, PUT, DELETE, etc.)

##### path

`string`

API endpoint path relative to the app base URL

##### data?

`any`

Request body payload (sent as JSON)

##### options?

`RequestOptions`

Additional request options (headers, timeout, etc.)

#### Returns

`Promise`\<`any`\>

***

### setShouldConnect()

> **setShouldConnect**(`shouldConnect`): `Promise`\<`void`\>

Set whether the client should maintain a WebSocket connection.

#### Parameters

##### shouldConnect

`boolean`

If true, the client will connect and auto-reconnect; if false, it disconnects and stays disconnected

#### Returns

`Promise`\<`void`\>

## Events

### emit()

> **emit**\<`K`\>(`type`, `args`): `void`

Emit a client event.

#### Type Parameters

##### K

`K` *extends* keyof [`JsBaoEvents`](../interfaces/JsBaoEvents.md)

#### Parameters

##### type

`K`

The event name to emit

##### args

\[[`JsBaoEvents`](../interfaces/JsBaoEvents.md)\[`K`\]\]

The event payload wrapped in an array

#### Returns

`void`

#### Overrides

`Observable.emit`

***

### off()

> **off**\<`K`\>(`type`, `f`): `void`

Unsubscribe from a client event.

#### Type Parameters

##### K

`K` *extends* keyof [`JsBaoEvents`](../interfaces/JsBaoEvents.md)

#### Parameters

##### type

`K`

The event name to stop listening for

##### f

(`payload`) => `void`

The callback to remove

#### Returns

`void`

#### Overrides

`Observable.off`

***

### on()

> **on**\<`K`\>(`type`, `f`): `void`

Subscribe to a client event.

#### Type Parameters

##### K

`K` *extends* keyof [`JsBaoEvents`](../interfaces/JsBaoEvents.md)

#### Parameters

##### type

`K`

The event name to listen for

##### f

(`payload`) => `void`

Callback invoked when the event fires

#### Returns

`void`

#### Overrides

`Observable.on`

## Network

### getNetworkStatus()

> **getNetworkStatus**(): `object`

Get the current network status including connectivity and transport state.

#### Returns

`object`

Object with network `mode`, WebSocket `transport` state, `isOnline` flag, and optional `lastOnlineAt`/`lastError`

##### connected?

> `optional` **connected**: `boolean`

##### isOnline

> **isOnline**: `boolean`

##### lastError?

> `optional` **lastError**: `string`

##### lastOnlineAt?

> `optional` **lastOnlineAt**: `string`

##### mode

> **mode**: `"auto"` \| `"online"` \| `"offline"`

##### transport

> **transport**: `"connected"` \| `"connecting"` \| `"disconnected"`

***

### goOffline()

> **goOffline**(`opts?`): `Promise`\<`void`\>

Switch the client to offline mode.

#### Parameters

##### opts?

[`GoOfflineOptions`](../interfaces/GoOfflineOptions.md)

Optional configuration

#### Returns

`Promise`\<`void`\>

***

### goOnline()

> **goOnline**(): `Promise`\<`void`\>

Switch the client back to online mode.

#### Returns

`Promise`\<`void`\>

***

### isOnline()

> **isOnline**(): `boolean`

Check if the client is currently online.

#### Returns

`boolean`

***

### setNetworkMode()

> **setNetworkMode**(`mode`): `Promise`\<`void`\>

Set the network mode (auto, online, or offline).

#### Parameters

##### mode

"auto" to connect/disconnect based on connectivity, "online" to force connection, "offline" to force disconnection

`"auto"` | `"online"` | `"offline"`

#### Returns

`Promise`\<`void`\>

## Offline & Sync

### enableOfflineAccess()

> **enableOfflineAccess**(`options?`): `Promise`\<\{ `enabled`: `boolean`; `method?`: `"largeBlob"` \| `"pin"` \| `"signed"`; `reason?`: `string`; \}\>

Enable offline access using passkey or PIN authentication.

#### Parameters

##### options?

[`EnableOfflineAccessOptions`](../interfaces/EnableOfflineAccessOptions.md)

Controls how offline credentials are created and stored

#### Returns

`Promise`\<\{ `enabled`: `boolean`; `method?`: `"largeBlob"` \| `"pin"` \| `"signed"`; `reason?`: `string`; \}\>

Object with `enabled` flag, the `method` used (largeBlob, pin, or signed), and an optional `reason` if not enabled

***

### evictAllLocal()

> **evictAllLocal**(`opts?`): `Promise`\<`void`\>

Remove all locally stored document data.

#### Parameters

##### opts?

[`EvictAllLocalOptions`](../interfaces/EvictAllLocalOptions.md)

Optional eviction behavior

#### Returns

`Promise`\<`void`\>

***

### evictLocalDocument()

> **evictLocalDocument**(`documentId`, `opts?`): `Promise`\<`void`\>

Remove a document's local data from storage.

#### Parameters

##### documentId

`string`

The document to evict

##### opts?

Optional eviction behavior

###### force?

`boolean`

If true, evicts even if the document has unsynced local changes

###### suppressMetadataEvent?

`boolean`

If true, does not emit a documentMetadataChanged event

#### Returns

`Promise`\<`void`\>

***

### getLocalMetadata()

> **getLocalMetadata**(`documentId`): `Promise`\<`LocalMetadataEntry` \| `null`\>

Get locally stored metadata for a document.

#### Parameters

##### documentId

`string`

The document to get metadata for

#### Returns

`Promise`\<`LocalMetadataEntry` \| `null`\>

***

### getOfflineGrantStatus()

> **getOfflineGrantStatus**(): `object`

Get detailed status of the offline access grant.

#### Returns

`object`

Object with `available` flag, optional `expiresAt` timestamp, `daysLeft` until expiry, and storage `method`

##### available

> **available**: `boolean`

##### daysLeft?

> `optional` **daysLeft**: `number`

##### expiresAt?

> `optional` **expiresAt**: `string`

##### method?

> `optional` **method**: `"largeBlob"` \| `"pin"` \| `"signed"`

***

### getOfflineIdentity()

> **getOfflineIdentity**(): \{ `appId`: `string`; `email?`: `string`; `name?`: `string`; `rootDocId`: `string`; `userId`: `string`; \} \| `null`

Get the offline identity (user info available when offline).

#### Returns

\{ `appId`: `string`; `email?`: `string`; `name?`: `string`; `rootDocId`: `string`; `userId`: `string`; \} \| `null`

The offline user identity with `userId`, `appId`, `rootDocId`, and optional `email`/`name`, or null if unavailable

***

### getOfflineInfo()

> **getOfflineInfo**(`documentId`): `object`

Get offline status information for a document.

#### Parameters

##### documentId

`string`

The document to get offline info for

#### Returns

`object`

Object with `offlineEnabled`, `hasPersistence`, `isIdbSyncing` flags, optional `updatesStoreSize`, and `hasUnsyncedLocalChanges`

##### hasPersistence

> **hasPersistence**: `boolean`

##### hasUnsyncedLocalChanges?

> `optional` **hasUnsyncedLocalChanges**: `boolean`

##### isIdbSyncing

> **isIdbSyncing**: `boolean`

##### offlineEnabled

> **offlineEnabled**: `boolean`

##### updatesStoreSize?

> `optional` **updatesStoreSize**: `number`

***

### hasIndexedDbPersistence()

> **hasIndexedDbPersistence**(`documentId`): `Promise`\<`boolean`\>

Check if a document has IndexedDB persistence.

#### Parameters

##### documentId

`string`

The document to check for local persistence

#### Returns

`Promise`\<`boolean`\>

***

### hasLocalCopy()

> **hasLocalCopy**(`documentId`): `boolean`

Check if a document has local data available.

#### Parameters

##### documentId

`string`

The document to check for local data

#### Returns

`boolean`

***

### hasOfflineGrantStored()

> **hasOfflineGrantStored**(): `Promise`\<`boolean`\>

Check if an offline grant is stored locally.

#### Returns

`Promise`\<`boolean`\>

***

### isDocumentSynced()

> **isDocumentSynced**(`documentId`): `boolean`

Check if a document's data is synced with the server.

#### Parameters

##### documentId

`string`

The document to check sync status for

#### Returns

`boolean`

***

### isOfflineGrantAvailable()

> **isOfflineGrantAvailable**(): `boolean`

Check if an offline access grant is currently active.

#### Returns

`boolean`

***

### isSynced()

> **isSynced**(`documentId`): `boolean`

Check if a document is synced with the server.

#### Parameters

##### documentId

`string`

The document to check sync status for

#### Returns

`boolean`

***

### listLocalDocuments()

> **listLocalDocuments**(): `Promise`\<`LocalDocumentEntry`[]\>

List all documents stored locally.

#### Returns

`Promise`\<`LocalDocumentEntry`[]\>

***

### listLocalDocumentsUnified()

> **listLocalDocumentsUnified**(`options?`): `Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md)[]\>

List documents with merged local and server metadata.

#### Parameters

##### options?

[`ListLocalDocumentsOptions`](../interfaces/ListLocalDocumentsOptions.md)

Optional filters

#### Returns

`Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md)[]\>

***

### renewOfflineGrantOnline()

> **renewOfflineGrantOnline**(`pinProvider?`): `Promise`\<`boolean`\>

Renew the offline access grant while online.

#### Parameters

##### pinProvider?

() => `Promise`\<`string`\>

Async function that prompts for a PIN; required for PIN-based grants

#### Returns

`Promise`\<`boolean`\>

***

### revokeOfflineGrant()

> **revokeOfflineGrant**(`opts?`): `Promise`\<`void`\>

Revoke the offline access grant.

#### Parameters

##### opts?

[`RevokeOfflineGrantOptions`](../interfaces/RevokeOfflineGrantOptions.md)

Optional revocation behavior

#### Returns

`Promise`\<`void`\>

***

### setRetentionPolicy()

> **setRetentionPolicy**(`opts`): `void`

Configure the local document retention policy.

#### Parameters

##### opts

Retention policy settings

###### default

`"persist"` \| `"session"`

Default retention mode: "persist" keeps documents across sessions, "session" evicts on sign-out

###### maxBytes?

`number`

Maximum total bytes of local document data; oldest documents evicted when exceeded

###### maxDocs?

`number`

Maximum number of documents to keep locally; oldest are evicted first

###### preserveOnSignOut?

`boolean`

If true, retains local data even when the user signs out

###### ttlMs?

`number`

Time-to-live in milliseconds; documents older than this are evicted

#### Returns

`void`

***

### startNetworkSync()

> **startNetworkSync**(`documentId`): `Promise`\<`void`\>

Start network syncing for a document that was opened with deferred sync.

#### Parameters

##### documentId

`string`

The document to begin syncing with the server

#### Returns

`Promise`\<`void`\>

***

### syncMetadata()

> **syncMetadata**(`options?`): `Promise`\<`void`\>

Sync document metadata with the server.

#### Parameters

##### options?

`SyncMetadataOptions`

Controls the scope and behavior of the metadata sync

#### Returns

`Promise`\<`void`\>

***

### syncMetadataForDocument()

> **syncMetadataForDocument**(`documentId`, `options?`): `Promise`\<`void`\>

Sync metadata for a specific document.

#### Parameters

##### documentId

`string`

The document whose metadata to sync

##### options?

Optional sync behavior controls

###### background?

`boolean`

If true, silently swallows errors instead of throwing

###### payload?

`any`

Pre-fetched metadata payload to merge instead of fetching from server

###### payloadType?

`"full"` \| `"ids"`

Whether the payload contains full metadata objects or just IDs

###### shouldRetain?

(`docId`) => `boolean`

Predicate controlling which documents are kept in the local cache

#### Returns

`Promise`\<`void`\>

***

### unlockOffline()

> **unlockOffline**(`pinProvider?`): `Promise`\<`boolean`\>

Unlock offline access using stored credentials.

#### Parameters

##### pinProvider?

() => `Promise`\<`string`\>

Async function that prompts the user for a PIN; required when the offline grant uses PIN-based storage

#### Returns

`Promise`\<`boolean`\>

***

### updateLocalSnapshotFlag()

> **updateLocalSnapshotFlag**(`documentId`, `hasSnapshot`): `Promise`\<`void`\>

Update the local snapshot flag for a document.

#### Parameters

##### documentId

`string`

The document to update the snapshot flag for

##### hasSnapshot

`boolean`

Whether the document has a local IndexedDB snapshot

#### Returns

`Promise`\<`void`\>

***

### upsertServerDocuments()

> **upsertServerDocuments**(`items`, `options?`): `void`

Update local metadata cache with server document data.

#### Parameters

##### items

Array of server document records to merge into the local cache

`object`[] | `undefined`

##### options?

Controls how the merge is performed

###### authoritative?

`boolean`

If true, evicts local entries not present in the server list

###### payloadType?

`"full"` \| `"ids"`

Whether items contain full metadata or just document IDs

###### retainIds?

`Iterable`\<`string`, `any`, `any`\>

Document IDs to keep locally even if missing from the server list

###### scope?

`"all"` \| `"single"`

Whether to replace all metadata or merge a single document

###### shouldRetain?

(`documentId`) => `boolean`

Predicate controlling which documents are kept during eviction

###### targetDocumentId?

`string`

Specific document ID to update when scope is "single"

#### Returns

`void`

***

### waitForInitialSync()

> **waitForInitialSync**(`documentId`, `timeoutMs`): `Promise`\<`void`\>

Wait until a document's initial sync with the server completes and
the local update queue is drained. This does NOT confirm the server
received the writes — use [waitForWriteConfirmation](#waitforwriteconfirmation) for that.

#### Parameters

##### documentId

`string`

The document to wait for

##### timeoutMs

`number` = `30000`

Maximum time to wait before rejecting (ms, default 30000)

#### Returns

`Promise`\<`void`\>

***

### waitForInSync()

> **waitForInSync**(`documentId`, `timeoutMs`, `pollMs`): `Promise`\<`void`\>

Wait until the client and server have identical document state.
Polls [checkStateVector](#checkstatevector) until `inSync` is true.

#### Parameters

##### documentId

`string`

The document to check

##### timeoutMs

`number` = `5000`

Maximum time to wait (ms, default 5000)

##### pollMs

`number` = `50`

Polling interval (ms, default 50)

#### Returns

`Promise`\<`void`\>

***

### waitForWriteConfirmation()

> **waitForWriteConfirmation**(`documentId`, `timeoutMs`, `pollMs`): `Promise`\<`void`\>

Wait until the server confirms it has all of this client's writes.
Polls [checkStateVector](#checkstatevector) until `includesWrites` is true.

#### Parameters

##### documentId

`string`

The document to check

##### timeoutMs

`number` = `5000`

Maximum time to wait (ms, default 5000)

##### pollMs

`number` = `50`

Polling interval (ms, default 50)

#### Returns

`Promise`\<`void`\>

## Sub-APIs

### analytics

> `readonly` **analytics**: [`AnalyticsClient`](../interfaces/AnalyticsClient.md)

Analytics client for tracking events and metrics.

***

### cache

> **cache**: [`CacheFacade`](../interfaces/CacheFacade.md)

Key-value cache facade backed by IndexedDB.

***

### collections

> **collections**: [`CollectionsAPI`](../interfaces/CollectionsAPI.md)

Sub-API for managing document collections.

***

### databases

> **databases**: [`DatabasesAPI`](../interfaces/DatabasesAPI.md)

Sub-API for managing databases.

***

### documents

> **documents**: [`DocumentsAPI`](../interfaces/DocumentsAPI.md)

Sub-API for managing documents (list, create, get, delete, share).

***

### gemini

> **gemini**: [`GeminiAPI`](../interfaces/GeminiAPI.md)

Sub-API for Gemini model operations.

***

### groups

> **groups**: [`GroupsAPI`](../interfaces/GroupsAPI.md)

Sub-API for managing groups and memberships.

***

### groupTypeConfigs

> **groupTypeConfigs**: [`GroupTypeConfigsAPI`](../interfaces/GroupTypeConfigsAPI.md)

Sub-API for managing group type configurations.

***

### integrations

> **integrations**: [`IntegrationsAPI`](../interfaces/IntegrationsAPI.md)

Sub-API for managing third-party integrations.

***

### llm

> **llm**: [`LlmAPI`](../interfaces/LlmAPI.md)

Sub-API for LLM (large language model) operations.

***

### me

> **me**: [`MeAPI`](../interfaces/MeAPI.md)

Sub-API for the current authenticated user's profile and preferences.

***

### prompts

> **prompts**: [`PromptsAPI`](../interfaces/PromptsAPI.md)

Sub-API for managing and executing prompts.

***

### ruleSets

> **ruleSets**: [`RuleSetsAPI`](../interfaces/RuleSetsAPI.md)

Sub-API for managing rule sets.

***

### session

> **session**: [`SessionAPI`](../interfaces/SessionAPI.md)

Sub-API for session management (sign in, sign out, token refresh).

***

### users

> **users**: [`UsersAPI`](../interfaces/UsersAPI.md)

Sub-API for managing app users.

***

### workflows

> **workflows**: [`WorkflowsAPI`](../interfaces/WorkflowsAPI.md)

Sub-API for managing and executing workflows.
