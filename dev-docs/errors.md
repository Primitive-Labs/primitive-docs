# Error handling — `JsBaoError`

Client calls reject/throw a `JsBaoError` carrying a machine-readable `code`. Catch it, narrow it, and switch on the code.

## The error code enum

Both clients ship the same wire strings for `JsBaoErrorCode`. In JS it's a string-literal union you compare directly (`e.code === "NOT_FOUND"`); in Swift it's a `String`-backed enum you match against cases (`err.code == .notFound`). The codes match one-to-one across platforms.

## Catching an error

Catch a `JsBaoError` thrown by a client call and read its `code`. JS narrows with the `isJsBaoError` guard inside a `catch`; Swift uses a typed `catch let err as JsBaoError`.

::: tip Divergent shape
`isJsBaoError` is a structural duck-type in JS — it returns `true` for any object with a string `code`, including errors revived from JSON. Swift's `isJsBaoError` (and the `catch let x as JsBaoError` pattern) is an exact, instance-only type check (no JSON-revival duck-typing), so only real `JsBaoError` instances match (sweep errors D3).
:::

::: code-group
<<< ./snippets/errors/catch-error.ts#example{ts} [JavaScript]
<<< ./snippets/errors/catch-error.swift#example{swift} [Swift]
:::

## Matching a specific code

Branch on one error code (here `NOT_FOUND`) to drive UI — show an empty state instead of failing.

::: tip Divergent shape
JS compares `code` against the wire string (`e.code === "NOT_FOUND"`); Swift matches the
`JsBaoErrorCode` enum case (`err.code == .notFound`). Use `.rawValue` if you need the wire string in
Swift. (Same enum-vs-string split described under "The error code enum" above.)
:::

::: code-group
<<< ./snippets/errors/match-code.ts#example{ts} [JavaScript]
<<< ./snippets/errors/match-code.swift#example{swift} [Swift]
:::

## Reading error details

Pull structured diagnostics off `error.details`.

`details` is typed `any` in JS and carries heterogeneous structured objects — numbers (`status`), nested objects (`payload`), and booleans. Swift types it as `[String: JSONValue]?`, so the same nested and non-string values are representable; unwrap a `JSONValue` to its scalar (`.numberValue`, `.boolValue`, etc.) before reading it.

::: tip Divergent shape
Swift drops the JS `name` field on the error object — use the typed `catch`/`is JsBaoError` check rather than a `name` discriminator (sweep errors D2).
:::

::: code-group
<<< ./snippets/errors/read-details.ts#example{ts} [JavaScript]
<<< ./snippets/errors/read-details.swift#example{swift} [Swift]
:::
