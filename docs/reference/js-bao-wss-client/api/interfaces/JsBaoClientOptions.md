[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / JsBaoClientOptions

# Interface: JsBaoClientOptions

## Properties

### analyticsAutoEvents?

> `optional` **analyticsAutoEvents**: [`AnalyticsAutoEventsOptions`](AnalyticsAutoEventsOptions.md)

***

### apiUrl

> **apiUrl**: `string`

***

### appId

> **appId**: `string`

***

### auth?

> `optional` **auth**: `object`

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

***

### autoOAuth?

> `optional` **autoOAuth**: `boolean`

***

### autoUnlockOfflineOnInit?

> `optional` **autoUnlockOfflineOnInit**: `boolean`

***

### blobUploadConcurrency?

> `optional` **blobUploadConcurrency**: `number`

***

### commitRetryBackoff?

> `optional` **commitRetryBackoff**: `object`

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

***

### databaseConfig?

> `optional` **databaseConfig**: [`DatabaseConfig`](DatabaseConfig.md)

***

### globalAdminAppId?

> `optional` **globalAdminAppId**: `string`

***

### logLevel?

> `optional` **logLevel**: `LogLevel`

***

### maxReconnectDelay?

> `optional` **maxReconnectDelay**: `number`

***

### models

> **models**: [`TypedModelConstructor`](../type-aliases/TypedModelConstructor.md)\<`any`\>[]

***

### oauthRedirectUri?

> `optional` **oauthRedirectUri**: `string`

***

### offline?

> `optional` **offline**: `boolean`

***

### onConnectivityCheck()?

> `optional` **onConnectivityCheck**: () => `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

***

### serviceWorkerBridge?

> `optional` **serviceWorkerBridge**: `object`

#### enabled?

> `optional` **enabled**: `boolean`

***

### suppressAutoLoginMs?

> `optional` **suppressAutoLoginMs**: `number`

***

### sync?

> `optional` **sync**: `object`

#### handshakeTimeoutMs?

> `optional` **handshakeTimeoutMs**: `number`

#### outboundDebounceMs?

> `optional` **outboundDebounceMs**: `number`

***

### token?

> `optional` **token**: `string`

***

### wsHeaders?

> `optional` **wsHeaders**: `Record`\<`string`, `string`\>

***

### wsUrl

> **wsUrl**: `string`
