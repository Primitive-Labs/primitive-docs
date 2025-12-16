[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CacheFacade

# Interface: CacheFacade

Defined in: [packages/js-bao-wss-client/api/cacheFacade.ts:3](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/cacheFacade.ts#L3)

## Properties

### clear()

> **clear**: (`key`) => `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/api/cacheFacade.ts:21](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/cacheFacade.ts#L21)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

***

### clearAll()

> **clearAll**: () => `Promise`\<`void`\>

Defined in: [packages/js-bao-wss-client/api/cacheFacade.ts:22](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/cacheFacade.ts#L22)

#### Returns

`Promise`\<`void`\>

***

### fetchCached()

> **fetchCached**: \<`T`\>(`keyOrParts`, `fetcher`, `options?`) => `Promise`\<`T` \| `null`\>

Defined in: [packages/js-bao-wss-client/api/cacheFacade.ts:5](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/cacheFacade.ts#L5)

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

Defined in: [packages/js-bao-wss-client/api/cacheFacade.ts:10](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/cacheFacade.ts#L10)

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

Defined in: [packages/js-bao-wss-client/api/cacheFacade.ts:20](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/cacheFacade.ts#L20)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<\{ `ageMs?`: `number`; `updatedAt?`: `string`; \}\>

***

### key()

> **key**: (`base`, `params?`) => `string`

Defined in: [packages/js-bao-wss-client/api/cacheFacade.ts:4](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/cacheFacade.ts#L4)

#### Parameters

##### base

`string`

##### params?

`any`

#### Returns

`string`
