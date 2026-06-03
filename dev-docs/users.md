# users — `client.users`

Look up other users in the current app. The signed-in user lives on [`me`](/me).

::: warning Swift parity gap
All three `users` methods return untyped dictionaries in Swift —
`getBasic`/`lookup` return `[String: Any]` and `getProfiles` returns
`[[String: Any]]` — where JS returns the named `BasicUserInfo`,
`{ exists, user? }`, and `BatchUserProfile[]` shapes. The fields shown in the JS
snippets are the same, but you hand-parse them out of the dictionary in Swift
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

## getBasic(userId)

One user's basic public profile by id.

::: warning Swift parity gap
Swift's `getBasic` takes a generic `FetchCachedOptions` rather than JS's named
`GetUserOptions` (the four fields match) (users D1). It also skips caching and the
staleness options entirely when no cache facade is injected, where JS always
caches (users D2) — confirm a cache is wired up if you rely on the offline/stale
knobs.
:::

::: code-group
<<< ./snippets/users/get-basic.ts#example{ts} [JavaScript]
<<< ./snippets/users/get-basic.swift#example{swift} [Swift]
:::

## getProfiles(ids)

Batch-fetch several basic profiles in one round-trip.

::: code-group
<<< ./snippets/users/get-profiles.ts#example{ts} [JavaScript]
<<< ./snippets/users/get-profiles.swift#example{swift} [Swift]
:::

## lookup(email)

Find a user by email address.

::: code-group
<<< ./snippets/users/lookup.ts#example{ts} [JavaScript]
<<< ./snippets/users/lookup.swift#example{swift} [Swift]
:::
