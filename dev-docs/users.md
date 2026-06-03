# users — `client.users`

Look up other users in the current app. The signed-in user lives on [`me`](/me).

::: tip Now typed in Swift
All three `users` methods return named Swift models matching the JS shapes:
`getBasic → BasicUserInfo`, `getProfiles → [BatchUserProfile]`, and
`lookup → UserLookupResult` (`{ exists, user? }`). No more hand-parsing
dictionaries ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

## getBasic(userId)

One user's basic public profile by id.

Swift's `getBasic` now takes the named `GetUserOptions` (the same four
fields as JS — `refreshIfOlderThanMs`, `waitForLoad`, `refreshNetwork`,
`serverTimeoutMs`), resolving the former generic-`FetchCachedOptions` gap
(users D1).

::: warning Swift parity gap
`getBasic` still skips caching and the staleness options entirely when no
cache facade is injected, where JS always caches (users D2) — confirm a cache
is wired up if you rely on the offline/stale knobs.
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
