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

- [`initJsBao`](../variables/initJsBao.md)\<`any`\>

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

## Properties

### analytics

> `readonly` **analytics**: [`AnalyticsClient`](../interfaces/AnalyticsClient.md)

***

### cache

> **cache**: [`CacheFacade`](../interfaces/CacheFacade.md)

***

### documents

> **documents**: `DocumentsAPI`

***

### gemini

> **gemini**: `GeminiAPI`

***

### integrations

> **integrations**: [`IntegrationsAPI`](../interfaces/IntegrationsAPI.md)

***

### llm

> **llm**: `LlmAPI`

***

### me

> **me**: `MeAPI`

***

### session

> **session**: `SessionAPI`

***

### users

> **users**: `UsersAPI`

## Methods

### addDocumentModelMapping()

> **addDocumentModelMapping**(`modelName`, `documentId`): `void`

#### Parameters

##### modelName

`string`

##### documentId

`string`

#### Returns

`void`

***

### cancelPendingCreate()

> **cancelPendingCreate**(`documentId`, `opts?`): `Promise`\<`void`\>

#### Parameters

##### documentId

`string`

##### opts?

###### evictLocal?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### checkOAuthAvailable()

> **checkOAuthAvailable**(): `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

***

### clearDefaultDocumentId()

> **clearDefaultDocumentId**(): `void`

#### Returns

`void`

***

### clearDocumentModelMapping()

> **clearDocumentModelMapping**(`modelName`): `void`

#### Parameters

##### modelName

`string`

#### Returns

`void`

***

### clearSelfRemovalPending()

> **clearSelfRemovalPending**(`documentId`): `void`

#### Parameters

##### documentId

`string`

#### Returns

`void`

***

### closeDocument()

> **closeDocument**(`documentId`, `options?`): `Promise`\<`void`\>

#### Parameters

##### documentId

`string`

##### options?

###### evictLocal?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### commitOfflineCreate()

> **commitOfflineCreate**(`documentId`, `opts?`): `Promise`\<\{ `created`: `boolean`; `linked?`: `boolean`; `reason?`: `string`; \}\>

#### Parameters

##### documentId

`string`

##### opts?

###### onExists?

`"link"` \| `"fail"`

#### Returns

`Promise`\<\{ `created`: `boolean`; `linked?`: `boolean`; `reason?`: `string`; \}\>

***

### connect()

> **connect**(): `void`

#### Returns

`void`

***

### createDocument()

> **createDocument**(`options`): `Promise`\<\{ `metadata`: `any`; \}\>

#### Parameters

##### options

###### localOnly?

`boolean`

###### title?

`string`

#### Returns

`Promise`\<\{ `metadata`: `any`; \}\>

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### document()

> **document**(`documentId`): `DocumentContext`

#### Parameters

##### documentId

`string`

#### Returns

`DocumentContext`

***

### emit()

> **emit**\<`K`\>(`type`, `args`): `void`

#### Type Parameters

##### K

`K` *extends* keyof [`JsBaoEvents`](../interfaces/JsBaoEvents.md)

#### Parameters

##### type

`K`

##### args

\[[`JsBaoEvents`](../interfaces/JsBaoEvents.md)\[`K`\]\]

#### Returns

`void`

***

### enableOfflineAccess()

> **enableOfflineAccess**(`options?`): `Promise`\<\{ `enabled`: `boolean`; `method?`: `"largeBlob"` \| `"pin"` \| `"signed"`; `reason?`: `string`; \}\>

#### Parameters

##### options?

###### allowPinFallback?

`boolean`

###### pinProvider?

() => `Promise`\<`string`\>

###### preferBiometric?

`boolean`

###### retention?

\{ `preserveOnSignOut?`: `boolean`; \}

###### retention.preserveOnSignOut?

`boolean`

###### ttlDays?

`number`

#### Returns

`Promise`\<\{ `enabled`: `boolean`; `method?`: `"largeBlob"` \| `"pin"` \| `"signed"`; `reason?`: `string`; \}\>

***

### evictAllLocal()

> **evictAllLocal**(`opts?`): `Promise`\<`void`\>

#### Parameters

##### opts?

###### onlySynced?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### evictLocalDocument()

> **evictLocalDocument**(`documentId`, `opts?`): `Promise`\<`void`\>

#### Parameters

##### documentId

`string`

##### opts?

###### force?

`boolean`

###### suppressMetadataEvent?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### forceReconnect()

> **forceReconnect**(): `void`

#### Returns

`void`

***

### getApiUrl()

> **getApiUrl**(): `string`

#### Returns

`string`

***

### getAppId()

> **getAppId**(): `string`

#### Returns

`string`

***

### getAuthPersistenceInfo()

> **getAuthPersistenceInfo**(): `object`

#### Returns

`object`

##### hydrated

> **hydrated**: `boolean`

##### mode

> **mode**: `"memory"` \| `"persisted"`

***

### getAuthState()

> **getAuthState**(): `object`

#### Returns

`object`

##### authenticated

> **authenticated**: `boolean`

##### mode

> **mode**: `"none"` \| `"online"` \| `"offline"`

##### userId?

> `optional` **userId**: `string`

***

### getAwarenessStates()

> **getAwarenessStates**(`documentId`): `Map`\<`string`, `any`\>

#### Parameters

##### documentId

`string`

#### Returns

`Map`\<`string`, `any`\>

***

### getBlobManager()

> **getBlobManager**(): `BlobManager`

#### Returns

`BlobManager`

***

### getBlobUploadConcurrency()

> **getBlobUploadConcurrency**(): `number`

#### Returns

`number`

***

### getConnectionId()

> **getConnectionId**(): `string`

#### Returns

`string`

***

### getDefaultDocumentId()

> **getDefaultDocumentId**(): `string` \| `null`

#### Returns

`string` \| `null`

***

### getDoc()

> **getDoc**(`documentId`): `any`

#### Parameters

##### documentId

`string`

#### Returns

`any`

***

### getDocDebug()

> **getDocDebug**(`documentId`): `DocumentDebugSnapshot`

#### Parameters

##### documentId

`string`

#### Returns

`DocumentDebugSnapshot`

***

### getDocHash()

> **getDocHash**(`documentId`): `Promise`\<`string`\>

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<`string`\>

***

### getDocumentModelMapping()

> **getDocumentModelMapping**(`modelName`): `string` \| `null`

#### Parameters

##### modelName

`string`

#### Returns

`string` \| `null`

***

### getDocumentPermission()

> **getDocumentPermission**(`documentId`): `DocumentPermission` \| `null`

#### Parameters

##### documentId

`string`

#### Returns

`DocumentPermission` \| `null`

***

### getGeminiAnalyticsContext()

> **getGeminiAnalyticsContext**(): \{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

#### Returns

\{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

***

### getGlobalAdminAppId()

> **getGlobalAdminAppId**(): `string`

#### Returns

`string`

***

### getLlmAnalyticsContext()

> **getLlmAnalyticsContext**(): \{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

#### Returns

\{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

***

### getLocalAwarenessState()

> **getLocalAwarenessState**(`documentId`): `any`

#### Parameters

##### documentId

`string`

#### Returns

`any`

***

### getLocalMetadata()

> **getLocalMetadata**(`documentId`): `Promise`\<`LocalMetadataEntry` \| `null`\>

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<`LocalMetadataEntry` \| `null`\>

***

### getNetworkStatus()

> **getNetworkStatus**(): `object`

#### Returns

`object`

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

### getOfflineGrantStatus()

> **getOfflineGrantStatus**(): `object`

#### Returns

`object`

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

#### Returns

\{ `appId`: `string`; `email?`: `string`; `name?`: `string`; `rootDocId`: `string`; `userId`: `string`; \} \| `null`

***

### getOfflineInfo()

> **getOfflineInfo**(`documentId`): `object`

#### Parameters

##### documentId

`string`

#### Returns

`object`

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

### getRootDocId()

> **getRootDocId**(): `string` \| `null`

#### Returns

`string` \| `null`

***

### getToken()

> **getToken**(): `string` \| `null`

#### Returns

`string` \| `null`

***

### getUserId()

> **getUserId**(): `string` \| `null`

#### Returns

`string` \| `null`

***

### goOffline()

> **goOffline**(`opts?`): `Promise`\<`void`\>

#### Parameters

##### opts?

###### reason?

`string`

#### Returns

`Promise`\<`void`\>

***

### goOnline()

> **goOnline**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### handleOAuthCallback()

> **handleOAuthCallback**(`code`, `state`): `Promise`\<`void`\>

#### Parameters

##### code

`string`

##### state

`string`

#### Returns

`Promise`\<`void`\>

***

### hasIndexedDbPersistence()

> **hasIndexedDbPersistence**(`documentId`): `Promise`\<`boolean`\>

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### hasLocalCopy()

> **hasLocalCopy**(`documentId`): `boolean`

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### hasOfflineGrantStored()

> **hasOfflineGrantStored**(): `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

***

### isAuthenticated()

> **isAuthenticated**(): `boolean`

#### Returns

`boolean`

***

### isConnected()

> **isConnected**(): `boolean`

#### Returns

`boolean`

***

### isDocOpen()

> **isDocOpen**(`documentId`): `boolean`

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isDocumentReadOnly()

> **isDocumentReadOnly**(`documentId`): `boolean`

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isDocumentSynced()

> **isDocumentSynced**(`documentId`): `boolean`

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isMetadataDeleted()

> **isMetadataDeleted**(`documentId`): `boolean`

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isOfflineGrantAvailable()

> **isOfflineGrantAvailable**(): `boolean`

#### Returns

`boolean`

***

### isOnline()

> **isOnline**(): `boolean`

#### Returns

`boolean`

***

### isPendingCreate()

> **isPendingCreate**(`documentId`): `boolean`

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isRootDocument()

> **isRootDocument**(`documentId`): `boolean`

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isSynced()

> **isSynced**(`documentId`): `boolean`

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### listLocalDocuments()

> **listLocalDocuments**(): `Promise`\<`LocalDocumentEntry`[]\>

#### Returns

`Promise`\<`LocalDocumentEntry`[]\>

***

### listLocalDocumentsUnified()

> **listLocalDocumentsUnified**(`options?`): `Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md)[]\>

#### Parameters

##### options?

###### includeRoot?

`boolean`

###### onlyWithLocalData?

`boolean`

#### Returns

`Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md)[]\>

***

### listOpenDocuments()

> **listOpenDocuments**(): `string`[]

#### Returns

`string`[]

***

### listPendingCreates()

> **listPendingCreates**(): `Promise`\<`object`[]\>

#### Returns

`Promise`\<`object`[]\>

***

### logout()

> **logout**(`options?`): `Promise`\<`void`\>

Logout: best-effort server cookie clear, shutdown networking, clear auth state, and optional local eviction.
- Preserves stored offline grant by default (does not delete it)
- Clears in-memory offline identity so the client is not considered authenticated

#### Parameters

##### options?

###### clearOfflineIdentity?

`boolean`

###### redirectTo?

`string`

###### revokeOffline?

`boolean`

###### waitForDisconnect?

`boolean`

###### wipeLocal?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### makeRequest()

> **makeRequest**(`method`, `path`, `data?`): `Promise`\<`any`\>

#### Parameters

##### method

`string`

##### path

`string`

##### data?

`any`

#### Returns

`Promise`\<`any`\>

***

### markMetadataDeleted()

> **markMetadataDeleted**(`documentId`): `number` \| `undefined`

#### Parameters

##### documentId

`string`

#### Returns

`number` \| `undefined`

***

### markSelfRemovalPending()

> **markSelfRemovalPending**(`documentId`): `void`

#### Parameters

##### documentId

`string`

#### Returns

`void`

***

### off()

> **off**\<`K`\>(`type`, `f`): `void`

#### Type Parameters

##### K

`K` *extends* keyof [`JsBaoEvents`](../interfaces/JsBaoEvents.md)

#### Parameters

##### type

`K`

##### f

(`payload`) => `void`

#### Returns

`void`

***

### on()

> **on**\<`K`\>(`type`, `f`): `void`

#### Type Parameters

##### K

`K` *extends* keyof [`JsBaoEvents`](../interfaces/JsBaoEvents.md)

#### Parameters

##### type

`K`

##### f

(`payload`) => `void`

#### Returns

`void`

***

### openDocument()

> **openDocument**(`documentId`, `options?`): `Promise`\<`Doc`\>

#### Parameters

##### documentId

`string`

##### options?

###### availabilityWaitMs?

`number`

###### deferNetworkSync?

`boolean`

###### enableNetworkSync?

`boolean`

###### retainLocal?

`boolean`

###### waitForLoad?

`"local"` \| `"network"` \| `"localIfAvailableElseNetwork"`

#### Returns

`Promise`\<`Doc`\>

***

### openDocumentByAlias()

> **openDocumentByAlias**(`alias`, `options?`): `Promise`\<\{ `doc`: `Doc`; `metadata`: `LocalMetadataEntry` \| `null`; \}\>

#### Parameters

##### alias

`ResolveAliasParams`

##### options?

###### availabilityWaitMs?

`number`

###### enableNetworkSync?

`boolean`

###### retainLocal?

`boolean`

###### waitForLoad?

`"local"` \| `"network"` \| `"localIfAvailableElseNetwork"`

#### Returns

`Promise`\<\{ `doc`: `Doc`; `metadata`: `LocalMetadataEntry` \| `null`; \}\>

***

### removeAwareness()

> **removeAwareness**(`documentId`, `clientIds`, `reason?`): `void`

#### Parameters

##### documentId

`string`

##### clientIds

`string`[]

##### reason?

`string`

#### Returns

`void`

***

### removeAwarenessStates()

> **removeAwarenessStates**(`documentId`, `clientIds`, `reason?`): `void`

#### Parameters

##### documentId

`string`

##### clientIds

`string`[]

##### reason?

`string`

#### Returns

`void`

***

### renewOfflineGrantOnline()

> **renewOfflineGrantOnline**(`pinProvider?`): `Promise`\<`boolean`\>

#### Parameters

##### pinProvider?

() => `Promise`\<`string`\>

#### Returns

`Promise`\<`boolean`\>

***

### retryCommit()

> **retryCommit**(`documentId`): `Promise`\<\{ `created`: `boolean`; \} \| `null`\>

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<\{ `created`: `boolean`; \} \| `null`\>

***

### revokeOfflineGrant()

> **revokeOfflineGrant**(`opts?`): `Promise`\<`void`\>

#### Parameters

##### opts?

###### wipeLocal?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### runLocalTransaction()

> **runLocalTransaction**(`documentId`, `fn`): `void`

#### Parameters

##### documentId

`string`

##### fn

() => `void`

#### Returns

`void`

***

### setAwareness()

> **setAwareness**(`documentId`, `state`): `void`

#### Parameters

##### documentId

`string`

##### state

`any`

#### Returns

`void`

***

### setBlobUploadConcurrency()

> **setBlobUploadConcurrency**(`value`): `void`

#### Parameters

##### value

`number`

#### Returns

`void`

***

### setDefaultDocumentId()

> **setDefaultDocumentId**(`documentId`): `void`

#### Parameters

##### documentId

`string`

#### Returns

`void`

***

### setLocalAwarenessState()

> **setLocalAwarenessState**(`documentId`, `state`): `void`

#### Parameters

##### documentId

`string`

##### state

`any`

#### Returns

`void`

***

### setLogLevel()

> **setLogLevel**(`level`): `void`

#### Parameters

##### level

`LogLevel`

#### Returns

`void`

***

### setNetworkMode()

> **setNetworkMode**(`mode`): `Promise`\<`void`\>

#### Parameters

##### mode

`"auto"` | `"online"` | `"offline"`

#### Returns

`Promise`\<`void`\>

***

### setRetentionPolicy()

> **setRetentionPolicy**(`opts`): `void`

#### Parameters

##### opts

###### default

`"persist"` \| `"session"`

###### maxBytes?

`number`

###### maxDocs?

`number`

###### preserveOnSignOut?

`boolean`

###### ttlMs?

`number`

#### Returns

`void`

***

### setShouldConnect()

> **setShouldConnect**(`shouldConnect`): `Promise`\<`void`\>

#### Parameters

##### shouldConnect

`boolean`

#### Returns

`Promise`\<`void`\>

***

### setToken()

> **setToken**(`token`, `options?`): `void`

#### Parameters

##### token

`string` | `null`

##### options?

###### cause?

`string`

#### Returns

`void`

***

### startNetworkSync()

> **startNetworkSync**(`documentId`): `Promise`\<`void`\>

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<`void`\>

***

### startOAuthFlow()

> **startOAuthFlow**(`continueUrl?`, `options?`): `Promise`\<`void`\>

#### Parameters

##### continueUrl?

`string`

##### options?

###### waitlist?

\{ `note?`: `string` \| `null`; `source?`: `string` \| `null`; \}

###### waitlist.note?

`string` \| `null`

###### waitlist.source?

`string` \| `null`

#### Returns

`Promise`\<`void`\>

***

### syncMetadata()

> **syncMetadata**(`options?`): `Promise`\<`void`\>

#### Parameters

##### options?

`SyncMetadataOptions`

#### Returns

`Promise`\<`void`\>

***

### syncMetadataForDocument()

> **syncMetadataForDocument**(`documentId`, `options?`): `Promise`\<`void`\>

#### Parameters

##### documentId

`string`

##### options?

###### background?

`boolean`

###### payload?

`any`

###### payloadType?

`"full"` \| `"ids"`

###### shouldRetain?

(`docId`) => `boolean`

#### Returns

`Promise`\<`void`\>

***

### unlockOffline()

> **unlockOffline**(`pinProvider?`): `Promise`\<`boolean`\>

#### Parameters

##### pinProvider?

() => `Promise`\<`string`\>

#### Returns

`Promise`\<`boolean`\>

***

### updateLocalMetadata()

> **updateLocalMetadata**(`documentId`, `updates`): `Promise`\<`void`\>

#### Parameters

##### documentId

`string`

##### updates

###### tags?

`string`[]

###### title?

`string`

#### Returns

`Promise`\<`void`\>

***

### updateLocalSnapshotFlag()

> **updateLocalSnapshotFlag**(`documentId`, `hasSnapshot`): `Promise`\<`void`\>

#### Parameters

##### documentId

`string`

##### hasSnapshot

`boolean`

#### Returns

`Promise`\<`void`\>

***

### upsertServerDocuments()

> **upsertServerDocuments**(`items`, `options?`): `void`

#### Parameters

##### items

`object`[] | `undefined`

##### options?

###### authoritative?

`boolean`

###### payloadType?

`"full"` \| `"ids"`

###### retainIds?

`Iterable`\<`string`, `any`, `any`\>

###### scope?

`"all"` \| `"single"`

###### shouldRetain?

(`documentId`) => `boolean`

###### targetDocumentId?

`string`

#### Returns

`void`

***

### waitForAuthBootstrap()

> **waitForAuthBootstrap**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### waitForAuthReady()

> **waitForAuthReady**(`options?`): `Promise`\<\{ `mode`: `"online"` \| `"offline"`; `userId`: `string`; \}\>

#### Parameters

##### options?

###### timeoutMs?

`number`

#### Returns

`Promise`\<\{ `mode`: `"online"` \| `"offline"`; `userId`: `string`; \}\>

***

### waitForSync()

> **waitForSync**(`documentId`, `timeoutMs`): `Promise`\<`void`\>

#### Parameters

##### documentId

`string`

##### timeoutMs

`number` = `30000`

#### Returns

`Promise`\<`void`\>

***

### waitForUserId()

> **waitForUserId**(`options?`): `Promise`\<`string`\>

#### Parameters

##### options?

###### timeoutMs?

`number`

#### Returns

`Promise`\<`string`\>

***

### exchangeOAuthCode()

> `static` **exchangeOAuthCode**(`params`): `Promise`\<`string`\>

Exchange an OAuth authorization code for an access token without constructing a client instance.

#### Parameters

##### params

###### apiUrl

`string`

###### appId

`string`

###### code

`string`

###### refreshProxyBaseUrl?

`string` \| `null`

###### refreshProxyCookieMaxAgeSeconds?

`number`

###### state

`string`

#### Returns

`Promise`\<`string`\>
