[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / JsBaoClient

# Class: JsBaoClient

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:508](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L508)

JsBaoClient - Multi-tenant client for js-bao-wss

Provides a hierarchical API for:
- HTTP operations: document management, permissions, user profile, session
- Real-time operations: multiplexed Y.Doc updates over WebSocket
- Awareness: collaborative presence state

## Extends

- `Observable`\<`any`\>

## Constructors

### Constructor

> **new JsBaoClient**(`options`): `JsBaoClient`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:781](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L781)

#### Parameters

##### options

[`JsBaoClientOptions`](../interfaces/JsBaoClientOptions.md)

#### Returns

`JsBaoClient`

#### Overrides

`Observable<any>.constructor`

## Properties

### \_observers

> **\_observers**: `Map`\<`any`, `any`\>

Defined in: packages/js-bao-wss-client/node\_modules/lib0/observable.d.ts:58

Some desc.

#### Inherited from

`Observable._observers`

***

### analytics

> `readonly` **analytics**: [`AnalyticsClient`](../interfaces/AnalyticsClient.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:539](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L539)

***

### cache

> **cache**: [`CacheFacade`](../interfaces/CacheFacade.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:582](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L582)

***

### documents

> **documents**: `DocumentsAPI`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:640](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L640)

***

### gemini

> **gemini**: `GeminiAPI`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:648](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L648)

***

### integrations

> **integrations**: [`IntegrationsAPI`](../interfaces/IntegrationsAPI.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:650](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L650)

***

### llm

> **llm**: `LlmAPI`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:647](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L647)

***

### me

> **me**: `MeAPI`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:645](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L645)

***

### session

> **session**: `SessionAPI`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:646](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L646)

***

### users

> **users**: `UsersAPI`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:649](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L649)

## Methods

### addDocumentModelMapping()

> **addDocumentModelMapping**(`modelName`, `documentId`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5450](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5450)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6595](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6595)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6193](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6193)

#### Returns

`Promise`\<`boolean`\>

***

### clearDefaultDocumentId()

> **clearDefaultDocumentId**(): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5528](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5528)

#### Returns

`void`

***

### clearDocumentModelMapping()

> **clearDocumentModelMapping**(`modelName`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5473](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5473)

#### Parameters

##### modelName

`string`

#### Returns

`void`

***

### clearSelfRemovalPending()

> **clearSelfRemovalPending**(`documentId`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:690](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L690)

#### Parameters

##### documentId

`string`

#### Returns

`void`

***

### closeDocument()

> **closeDocument**(`documentId`, `options?`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5426](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5426)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6574](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6574)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:4967](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L4967)

#### Returns

`void`

***

### createDocument()

> **createDocument**(`options`): `Promise`\<\{ `metadata`: `any`; \}\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6516](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6516)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:4991](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L4991)

#### Returns

`Promise`\<`void`\>

#### Overrides

`Observable.destroy`

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:4986](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L4986)

#### Returns

`Promise`\<`void`\>

***

### document()

> **document**(`documentId`): `DocumentContext`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:642](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L642)

#### Parameters

##### documentId

`string`

#### Returns

`DocumentContext`

***

### emit()

> **emit**\<`K`\>(`type`, `args`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1481](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1481)

Emit a named event. All registered event listeners that listen to the
specified name will receive the event.

#### Type Parameters

##### K

`K` *extends* keyof [`JsBaoEvents`](../interfaces/JsBaoEvents.md)

#### Parameters

##### type

`K`

##### args

\[[`JsBaoEvents`](../interfaces/JsBaoEvents.md)\[`K`\]\]

The arguments that are applied to the event listener.

#### Returns

`void`

#### Todo

This should catch exceptions

#### Overrides

`Observable.emit`

***

### enableOfflineAccess()

> **enableOfflineAccess**(`options?`): `Promise`\<\{ `enabled`: `boolean`; `method?`: `"largeBlob"` \| `"pin"` \| `"signed"`; `reason?`: `string`; \}\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5591](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5591)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6484](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6484)

#### Parameters

##### opts?

###### onlySynced?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### evictLocalDocument()

> **evictLocalDocument**(`documentId`, `opts?`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6464](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6464)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:4977](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L4977)

#### Returns

`void`

***

### getApiUrl()

> **getApiUrl**(): `string`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1834](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1834)

#### Returns

`string`

***

### getAppId()

> **getAppId**(): `string`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1838](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1838)

#### Returns

`string`

***

### getAuthPersistenceInfo()

> **getAuthPersistenceInfo**(): `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2833](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2833)

#### Returns

`object`

##### hydrated

> **hydrated**: `boolean`

##### mode

> **mode**: `"memory"` \| `"persisted"`

***

### getAuthState()

> **getAuthState**(): `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2815](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2815)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5952](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5952)

#### Parameters

##### documentId

`string`

#### Returns

`Map`\<`string`, `any`\>

***

### getBlobManager()

> **getBlobManager**(): `BlobManager`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1842](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1842)

#### Returns

`BlobManager`

***

### getBlobUploadConcurrency()

> **getBlobUploadConcurrency**(): `number`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1850](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1850)

#### Returns

`number`

***

### getConnectionId()

> **getConnectionId**(): `string`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:4982](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L4982)

#### Returns

`string`

***

### getDefaultDocumentId()

> **getDefaultDocumentId**(): `string` \| `null`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5539](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5539)

#### Returns

`string` \| `null`

***

### getDoc()

> **getDoc**(`documentId`): `Doc` \| `undefined`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5735](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5735)

#### Parameters

##### documentId

`string`

#### Returns

`Doc` \| `undefined`

***

### getDocDebug()

> **getDocDebug**(`documentId`): `DocumentDebugSnapshot`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6614](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6614)

#### Parameters

##### documentId

`string`

#### Returns

`DocumentDebugSnapshot`

***

### getDocHash()

> **getDocHash**(`documentId`): `Promise`\<`string`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:4010](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L4010)

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<`string`\>

***

### getDocumentModelMapping()

> **getDocumentModelMapping**(`modelName`): `string` \| `null`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5490](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5490)

#### Parameters

##### modelName

`string`

#### Returns

`string` \| `null`

***

### getDocumentPermission()

> **getDocumentPermission**(`documentId`): `DocumentPermission` \| `null`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2799](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2799)

#### Parameters

##### documentId

`string`

#### Returns

`DocumentPermission` \| `null`

***

### getGeminiAnalyticsContext()

> **getGeminiAnalyticsContext**(): \{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:3468](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L3468)

#### Returns

\{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

***

### getGlobalAdminAppId()

> **getGlobalAdminAppId**(): `string`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1871](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1871)

#### Returns

`string`

***

### getLlmAnalyticsContext()

> **getLlmAnalyticsContext**(): \{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:3446](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L3446)

#### Returns

\{ `isEnabled`: (`phase?`) => `boolean`; `logEvent`: (`event`) => `void`; \} \| `null`

***

### getLocalAwarenessState()

> **getLocalAwarenessState**(`documentId`): `any`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5948](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5948)

#### Parameters

##### documentId

`string`

#### Returns

`any`

***

### getLocalMetadata()

> **getLocalMetadata**(`documentId`): `Promise`\<`LocalMetadataEntry` \| `null`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6455](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6455)

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<`LocalMetadataEntry` \| `null`\>

***

### getNetworkStatus()

> **getNetworkStatus**(): `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6312](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6312)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5615](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5615)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5636](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5636)

#### Returns

\{ `appId`: `string`; `email?`: `string`; `name?`: `string`; `rootDocId`: `string`; `userId`: `string`; \} \| `null`

***

### getOfflineInfo()

> **getOfflineInfo**(`documentId`): `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5555](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5555)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2806](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2806)

#### Returns

`string` \| `null`

***

### getToken()

> **getToken**(): `string` \| `null`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6094](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6094)

#### Returns

`string` \| `null`

***

### getUserId()

> **getUserId**(): `string` \| `null`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2811](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2811)

#### Returns

`string` \| `null`

***

### goOffline()

> **goOffline**(`opts?`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6406](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6406)

#### Parameters

##### opts?

###### reason?

`string`

#### Returns

`Promise`\<`void`\>

***

### goOnline()

> **goOnline**(): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6411](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6411)

#### Returns

`Promise`\<`void`\>

***

### handleOAuthCallback()

> **handleOAuthCallback**(`code`, `state`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6211](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6211)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:3581](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L3581)

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### hasLocalCopy()

> **hasLocalCopy**(`documentId`): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5579](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5579)

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### hasOfflineGrantStored()

> **hasOfflineGrantStored**(): `Promise`\<`boolean`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5714](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5714)

#### Returns

`Promise`\<`boolean`\>

***

### isAuthenticated()

> **isAuthenticated**(): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2829](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2829)

#### Returns

`boolean`

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5751](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5751)

#### Returns

`boolean`

***

### isDocOpen()

> **isDocOpen**(`documentId`): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5747](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5747)

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isDocumentReadOnly()

> **isDocumentReadOnly**(`documentId`): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2794](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2794)

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isDocumentSynced()

> **isDocumentSynced**(`documentId`): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5755](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5755)

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isMetadataDeleted()

> **isMetadataDeleted**(`documentId`): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1863](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1863)

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isOfflineGrantAvailable()

> **isOfflineGrantAvailable**(): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5611](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5611)

#### Returns

`boolean`

***

### isOnline()

> **isOnline**(): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6338](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6338)

#### Returns

`boolean`

***

### isPendingCreate()

> **isPendingCreate**(`documentId`): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6591](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6591)

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isRootDocument()

> **isRootDocument**(`documentId`): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2855](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2855)

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### isSynced()

> **isSynced**(`documentId`): `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:3511](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L3511)

#### Parameters

##### documentId

`string`

#### Returns

`boolean`

***

### listLocalDocuments()

> **listLocalDocuments**(): `Promise`\<`LocalDocumentEntry`[]\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6432](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6432)

#### Returns

`Promise`\<`LocalDocumentEntry`[]\>

***

### listLocalDocumentsUnified()

> **listLocalDocumentsUnified**(`options?`): `Promise`\<[`DocumentInfo`](../interfaces/DocumentInfo.md)[]\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6440](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6440)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6428](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6428)

#### Returns

`string`[]

***

### listPendingCreates()

> **listPendingCreates**(): `Promise`\<`object`[]\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6585](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6585)

#### Returns

`Promise`\<`object`[]\>

***

### logout()

> **logout**(`options?`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6115](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6115)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2611](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2611)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1854](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1854)

#### Parameters

##### documentId

`string`

#### Returns

`number` \| `undefined`

***

### markSelfRemovalPending()

> **markSelfRemovalPending**(`documentId`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:676](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L676)

#### Parameters

##### documentId

`string`

#### Returns

`void`

***

### off()

> **off**\<`K`\>(`type`, `f`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1472](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1472)

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

#### Overrides

`Observable.off`

***

### on()

> **on**\<`K`\>(`type`, `f`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1463](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1463)

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

#### Overrides

`Observable.on`

***

### once()

> **once**(`name`, `f`): `void`

Defined in: packages/js-bao-wss-client/node\_modules/lib0/observable.d.ts:68

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

### openDocument()

> **openDocument**(`documentId`, `options?`): `Promise`\<`Doc`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5149](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5149)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5357](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5357)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:3649](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L3649)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5964](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5964)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5624](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5624)

#### Parameters

##### pinProvider?

() => `Promise`\<`string`\>

#### Returns

`Promise`\<`boolean`\>

***

### retryCommit()

> **retryCommit**(`documentId`): `Promise`\<\{ `created`: `boolean`; \} \| `null`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6554](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6554)

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<\{ `created`: `boolean`; \} \| `null`\>

***

### revokeOfflineGrant()

> **revokeOfflineGrant**(`opts?`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5630](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5630)

#### Parameters

##### opts?

###### wipeLocal?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### runLocalTransaction()

> **runLocalTransaction**(`documentId`, `fn`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5739](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5739)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:3516](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L3516)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1846](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1846)

#### Parameters

##### value

`number`

#### Returns

`void`

***

### setDefaultDocumentId()

> **setDefaultDocumentId**(`documentId`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5513](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5513)

#### Parameters

##### documentId

`string`

#### Returns

`void`

***

### setLocalAwarenessState()

> **setLocalAwarenessState**(`documentId`, `state`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5923](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5923)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5586](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5586)

#### Parameters

##### level

`LogLevel`

#### Returns

`void`

***

### setNetworkMode()

> **setNetworkMode**(`mode`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6342](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6342)

#### Parameters

##### mode

`"auto"` | `"online"` | `"offline"`

#### Returns

`Promise`\<`void`\>

***

### setRetentionPolicy()

> **setRetentionPolicy**(`opts`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6498](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6498)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5038](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5038)

#### Parameters

##### shouldConnect

`boolean`

#### Returns

`Promise`\<`void`\>

***

### setToken()

> **setToken**(`token`, `options?`): `void`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6098](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6098)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6416](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6416)

#### Parameters

##### documentId

`string`

#### Returns

`Promise`\<`void`\>

***

### startOAuthFlow()

> **startOAuthFlow**(`continueUrl?`, `options?`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:6197](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L6197)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1563](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1563)

#### Parameters

##### options?

`SyncMetadataOptions`

#### Returns

`Promise`\<`void`\>

***

### syncMetadataForDocument()

> **syncMetadataForDocument**(`documentId`, `options?`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1781](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1781)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5605](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5605)

#### Parameters

##### pinProvider?

() => `Promise`\<`string`\>

#### Returns

`Promise`\<`boolean`\>

***

### updateLocalMetadata()

> **updateLocalMetadata**(`documentId`, `updates`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5106](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5106)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:3590](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L3590)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1802](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1802)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2576](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2576)

#### Returns

`Promise`\<`void`\>

***

### waitForAuthReady()

> **waitForAuthReady**(`options?`): `Promise`\<\{ `mode`: `"online"` \| `"offline"`; `userId`: `string`; \}\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2849](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2849)

#### Parameters

##### options?

###### timeoutMs?

`number`

#### Returns

`Promise`\<\{ `mode`: `"online"` \| `"offline"`; `userId`: `string`; \}\>

***

### waitForSync()

> **waitForSync**(`documentId`, `timeoutMs`): `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:5760](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L5760)

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

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:2843](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L2843)

#### Parameters

##### options?

###### timeoutMs?

`number`

#### Returns

`Promise`\<`string`\>

***

### exchangeOAuthCode()

> `static` **exchangeOAuthCode**(`params`): `Promise`\<`string`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:1522](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L1522)

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
