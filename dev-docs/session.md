# session — `client.session`

Inspect the current authenticated session.

::: tip Divergent shape
The Swift `session.get()` returns an **untyped `[String: Any]`** where JS returns a typed
`SessionInfo` (`sessionId`, `userId`, `expiresAt`, `createdAt`, `lastActivity`). Both compile;
the shapes differ ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

## get()

Retrieve information about the current authenticated session.

::: code-group
<<< ./snippets/session/get.ts#example{ts} [JavaScript]
<<< ./snippets/session/get.swift#example{swift} [Swift]
:::
