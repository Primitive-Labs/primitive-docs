# cache — `client.cache`

General-purpose key-value cache with in-memory + persistent storage, request deduplication, and HTTP-aware caching.

## key(base, params?)

Build a deterministic cache key from a base string and optional params.

::: tip Divergent shape
The two clients produce **different keys** for the same inputs: JS serializes params as
`base:<stable-JSON>` and accepts any value (scalar, array, object), while Swift accepts only
`[String: Any]` and joins them as `base?k=v&…`. Keys are therefore not portable across platforms
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/cache/key.ts#example{ts} [JavaScript]
<<< ./snippets/cache/key.swift#example{swift} [Swift]
:::

## fetchCached(keyOrParts, fetcher, options?)

Return a cached value if present, otherwise run the fetcher and cache its result.

::: tip Divergent shape
JS accepts `string | any[]` for the key (an array is stable-serialized); Swift takes a `String`
only. Swift also silently ignores `waitForLoad`, `serverTimeoutMs`, and offline gating — only
`refreshNetwork` and `refreshIfOlderThanMs` take effect
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/cache/fetch-cached.ts#example{ts} [JavaScript]
<<< ./snippets/cache/fetch-cached.swift#example{swift} [Swift]
:::

## fetchHttp(req, options?)

Fetch from an HTTP endpoint with automatic caching keyed on the request.

::: warning Divergent shape — P0 behavior bug
JS serializes `query` into the request URL and folds `query` (plus `body` for non-GET) into the
cache key. **Swift drops `query` from both the request and the cache key**, never includes `body`
in the key, and ignores `serverTimeoutMs`/offline options. As a result, Swift sends unfiltered
requests and POSTs with different bodies collide on a single cache entry
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)). The shapes also differ: JS takes
a single `req` object, Swift takes positional params.
:::

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

The JS cache emits `cacheUpdated` (`{ key, updatedAt, source, value }`) on every successful network
refresh and `cacheUpdateFailed` (`{ key, error }`) on failure.

::: warning No Swift equivalent
JavaScript-only — the Swift `KvCache` has no emitter and fires no cache events
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)). These events are also not part
of the typed public event map, so they are not surfaced through `client.on(...)`.
:::

## KvCache.get / KvCache.set

Swift's underlying `KvCache` exposes public `get(key:)` and `set(key:value:)` methods for direct
reads and writes that bypass the facade.

::: warning No JavaScript equivalent
Swift-only — neither the JS `CacheFacade` nor the JS `KvCache` exposes `get`/`set`. On Swift these
live on the internal `KvCache` (not on `client.cache`), so they are not reachable through the
public facade ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::
