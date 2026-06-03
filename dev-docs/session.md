# session — `client.session`

Inspect the current authenticated session.

::: tip Now typed
Swift `session.get()` returns a typed `SessionInfo` (`sessionId`, `userId`, `expiresAt`,
`createdAt`, `lastActivity`), matching JS field-for-field
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

## get()

Retrieve information about the current authenticated session.

::: code-group
<<< ./snippets/session/get.ts#example{ts} [JavaScript]
<<< ./snippets/session/get.swift#example{swift} [Swift]
:::
