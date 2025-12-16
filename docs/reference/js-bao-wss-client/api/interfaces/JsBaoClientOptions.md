[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / JsBaoClientOptions

# Interface: JsBaoClientOptions

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:208](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L208)

## Properties

### analyticsAutoEvents?

> `optional` **analyticsAutoEvents**: [`AnalyticsAutoEventsOptions`](AnalyticsAutoEventsOptions.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:252](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L252)

***

### apiUrl

> **apiUrl**: `string`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:209](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L209)

***

### appId

> **appId**: `string`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:211](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L211)

***

### auth?

> `optional` **auth**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:224](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L224)

#### persistJwtInStorage?

> `optional` **persistJwtInStorage**: `boolean`

#### refreshProxy?

> `optional` **refreshProxy**: `object`

##### refreshProxy.baseUrl

> **baseUrl**: `string`

##### refreshProxy.cookieMaxAgeSeconds?

> `optional` **cookieMaxAgeSeconds**: `number`

##### refreshProxy.enabled?

> `optional` **enabled**: `boolean`

#### storageKeyPrefix?

> `optional` **storageKeyPrefix**: `string`

***

### autoNetwork?

> `optional` **autoNetwork**: `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:249](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L249)

***

### autoOAuth?

> `optional` **autoOAuth**: `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:215](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L215)

***

### autoUnlockOfflineOnInit?

> `optional` **autoUnlockOfflineOnInit**: `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:218](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L218)

***

### blobUploadConcurrency?

> `optional` **blobUploadConcurrency**: `number`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:221](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L221)

***

### commitRetryBackoff?

> `optional` **commitRetryBackoff**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:237](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L237)

#### baseMs?

> `optional` **baseMs**: `number`

#### factor?

> `optional` **factor**: `number`

#### jitter?

> `optional` **jitter**: `boolean`

#### maxMs?

> `optional` **maxMs**: `number`

***

### connectivityProbeTimeoutMs?

> `optional` **connectivityProbeTimeoutMs**: `number`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:250](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L250)

***

### databaseConfig?

> `optional` **databaseConfig**: [`DatabaseConfig`](DatabaseConfig.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:246](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L246)

***

### globalAdminAppId?

> `optional` **globalAdminAppId**: `string`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:219](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L219)

***

### logLevel?

> `optional` **logLevel**: `LogLevel`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:223](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L223)

***

### maxReconnectDelay?

> `optional` **maxReconnectDelay**: `number`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:214](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L214)

***

### models

> **models**: [`TypedModelConstructor`](../type-aliases/TypedModelConstructor.md)\<`any`\>[]

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:247](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L247)

***

### oauthRedirectUri?

> `optional` **oauthRedirectUri**: `string`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:216](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L216)

***

### offline?

> `optional` **offline**: `boolean`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:213](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L213)

***

### onConnectivityCheck()?

> `optional` **onConnectivityCheck**: () => `Promise`\<`boolean`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:251](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L251)

#### Returns

`Promise`\<`boolean`\>

***

### serviceWorkerBridge?

> `optional` **serviceWorkerBridge**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:243](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L243)

#### enabled?

> `optional` **enabled**: `boolean`

***

### suppressAutoLoginMs?

> `optional` **suppressAutoLoginMs**: `number`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:217](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L217)

***

### sync?

> `optional` **sync**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:233](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L233)

#### handshakeTimeoutMs?

> `optional` **handshakeTimeoutMs**: `number`

#### outboundDebounceMs?

> `optional` **outboundDebounceMs**: `number`

***

### token?

> `optional` **token**: `string`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:212](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L212)

***

### wsHeaders?

> `optional` **wsHeaders**: `Record`\<`string`, `string`\>

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:220](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L220)

***

### wsUrl

> **wsUrl**: `string`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:210](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L210)
