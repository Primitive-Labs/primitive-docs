[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CacheFacade

# Interface: CacheFacade

## Properties

### clear()

> **clear**: (`key`) => `Promise`\<`void`\>

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

***

### clearAll()

> **clearAll**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### fetchCached()

> **fetchCached**: \<`T`\>(`keyOrParts`, `fetcher`, `options?`) => `Promise`\<`T` \| `null`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### keyOrParts

`string` | `any`[]

##### fetcher

() => `Promise`\<`T`\>

##### options?

`FetchCachedOptions`

#### Returns

`Promise`\<`T` \| `null`\>

***

### fetchHttp()

> **fetchHttp**: \<`T`\>(`req`, `options?`) => `Promise`\<`T` \| `null`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### req

###### body?

`any`

###### keyBase?

`string`

###### method

`string`

###### path

`string`

###### query?

`Record`\<`string`, `any`\>

##### options?

`FetchCachedOptions`

#### Returns

`Promise`\<`T` \| `null`\>

***

### info()

> **info**: (`key`) => `Promise`\<\{ `ageMs?`: `number`; `updatedAt?`: `string`; \}\>

#### Parameters

##### key

`string`

#### Returns

`Promise`\<\{ `ageMs?`: `number`; `updatedAt?`: `string`; \}\>

***

### key()

> **key**: (`base`, `params?`) => `string`

#### Parameters

##### base

`string`

##### params?

`any`

#### Returns

`string`
