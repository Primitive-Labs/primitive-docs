# users — `client.users`

Look up other users in the current app. The signed-in user lives on [`me`](/me).

## getBasic(userId)

One user's basic public profile by id.

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
