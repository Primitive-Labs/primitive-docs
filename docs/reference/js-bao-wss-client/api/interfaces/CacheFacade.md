[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CacheFacade

# Interface: CacheFacade

## Properties

### clear()

> **clear**: (`key`) => `Promise`\<`void`\>

Removes a single entry from the cache by key.

#### Parameters

##### key

`string`

The cache key to remove

#### Returns

`Promise`\<`void`\>

***

### clearAll()

> **clearAll**: () => `Promise`\<`void`\>

Removes all entries from the cache.

#### Returns

`Promise`\<`void`\>

***

### fetchCached()

> **fetchCached**: \<`T`\>(`keyOrParts`, `fetcher`, `options?`) => `Promise`\<`T` \| `null`\>

Returns a cached value if available, otherwise calls the fetcher and caches the result.

#### Type Parameters

##### T

`T`

#### Parameters

##### keyOrParts

A cache key string or an array of parts to build a key from

`string` | `any`[]

##### fetcher

() => `Promise`\<`T`\>

Async function that produces the value when the cache misses

##### options?

`FetchCachedOptions`

Controls cache freshness, network behavior, and timeout

#### Returns

`Promise`\<`T` \| `null`\>

***

### fetchHttp()

> **fetchHttp**: \<`T`\>(`req`, `options?`) => `Promise`\<`T` \| `null`\>

Fetches data from an HTTP endpoint with automatic caching based on request parameters.

#### Type Parameters

##### T

`T`

#### Parameters

##### req

###### body?

`any`

Request body, included in cache key for non-GET requests

###### keyBase?

`string`

Custom base string for the cache key instead of the auto-generated one

###### method

`string`

HTTP method (e.g., "GET", "POST")

###### path

`string`

API endpoint path

###### query?

`Record`\<`string`, `any`\>

Query parameters appended to the request URL

##### options?

`FetchCachedOptions`

Controls cache freshness, network behavior, and timeout

#### Returns

`Promise`\<`T` \| `null`\>

***

### info()

> **info**: (`key`) => `Promise`\<\{ `ageMs?`: `number`; `updatedAt?`: `string`; \}\>

Returns metadata about a cache entry, including its age and last update time.

#### Parameters

##### key

`string`

The cache key to look up

#### Returns

`Promise`\<\{ `ageMs?`: `number`; `updatedAt?`: `string`; \}\>

***

### key()

> **key**: (`base`, `params?`) => `string`

Generates a deterministic cache key from a base string and optional parameters.

#### Parameters

##### base

`string`

The base string for the cache key (e.g., an endpoint name)

##### params?

`any`

Optional parameters that are hashed into the key for uniqueness

#### Returns

`string`
