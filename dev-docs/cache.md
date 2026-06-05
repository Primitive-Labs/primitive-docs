# cache — `client.cache`

General-purpose key-value cache with in-memory + persistent storage, request deduplication, and HTTP-aware caching.

## key(base, params?)

Build a deterministic cache key from a base string and optional params. With no params the key is the bare `base`; with params it is `base:<sorted-JSON>`, matching JS so keys are portable across platforms.

::: code-group
<<< ./snippets/cache/key.ts#example{ts} [JavaScript]
<<< ./snippets/cache/key.swift#example{swift} [Swift]
:::

## fetchCached(keyOrParts, fetcher, options?)

Return a cached value if present, otherwise run the fetcher and cache its result.

::: code-group
<<< ./snippets/cache/fetch-cached.ts#example{ts} [JavaScript]
<<< ./snippets/cache/fetch-cached.swift#example{swift} [Swift]
:::

## fetchHttp(req, options?)

Fetch from an HTTP endpoint with automatic caching keyed on the request.

::: code-group
<<< ./snippets/cache/fetch-http.ts#example{ts} [JavaScript]
<<< ./snippets/cache/fetch-http.swift#example{swift} [Swift]
:::

## info(key)

Read metadata (last update time + age) for a cache entry.

::: tip Divergent shape
JS returns an object `{ updatedAt?, ageMs? }` (`{}` on a miss); Swift returns a tuple
`(updatedAt: String?, ageMs: Double?)` (always present, `nil` members on a miss). `ageMs` is a JS
`number` vs a Swift `Double` ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/cache/info.ts#example{ts} [JavaScript]
<<< ./snippets/cache/info.swift#example{swift} [Swift]
:::

## clear(key)

Remove a single entry from the cache by key.

::: code-group
<<< ./snippets/cache/clear.ts#example{ts} [JavaScript]
<<< ./snippets/cache/clear.swift#example{swift} [Swift]
:::

## clearAll()

Remove every entry from the cache.

::: code-group
<<< ./snippets/cache/clear-all.ts#example{ts} [JavaScript]
<<< ./snippets/cache/clear-all.swift#example{swift} [Swift]
:::

## Cache events (cacheUpdated / cacheUpdateFailed)

Both clients emit `cacheUpdated` (`{ key, updatedAt, source, value }`) on every successful network
refresh and `cacheUpdateFailed` (`{ key, error }`) on failure, surfaced through
`client.events.on(.cacheUpdated)` / `.cacheUpdateFailed`
([#1042](https://github.com/Primitive-Labs/js-bao-wss/issues/1042)). The JS `me`-record re-emit
(`meUpdated` when `key == "me"`) is not yet wired on Swift — `.meUpdated` already fires from the
WS path.
