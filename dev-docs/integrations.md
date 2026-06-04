# integrations — `client.integrations`

Proxy calls to configured third-party integrations through the server.

## call(request)

Call a third-party integration through the server proxy and unwrap the
upstream response.

::: tip Now typed
The response `body` is a `JSONValue` (JS's generic `T` defaults to `any`) —
inspect it with `JSONValue`'s accessors/subscripts instead of casting from
`Any?` ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)). The
request `query` is `[String: JSONValue]` (mirroring JS's `Record<string, any>`),
the request `body` is `JSONValue`, and `method`/`path` are now optional with no
client-side default — omitting them sends no field, exactly like JS, so the
server can apply the integration's configured defaults
([#958](https://github.com/Primitive-Labs/js-bao-wss/issues/958)).
:::

::: code-group
<<< ./snippets/integrations/call.ts#example{ts} [JavaScript]
<<< ./snippets/integrations/call.swift#example{swift} [Swift]
:::

## list()

List the integrations configured for the current app. Returns
`[IntegrationInfo]`.

::: danger Swift-only and runtime-broken
The JS `integrations` surface is `call`-only — it exposes no catalog `list()`.
The Swift method also hits a route the server does not implement, so it returns
`[]` in practice. Kept for source parity and now typed, but don't rely on it
([#993](https://github.com/Primitive-Labs/js-bao-wss/issues/993)).
:::

<<< ./snippets/integrations/list.swift#example{swift} [Swift]

## get(integrationIdOrKey)

Fetch a single integration by id or key. Returns `IntegrationInfo?`.

::: danger Swift-only and runtime-broken
The JS `integrations` surface is `call`-only — it exposes no catalog `get()`.
The Swift method also hits a route the server does not implement, so it returns
`nil` in practice. Kept for source parity and now typed, but don't rely on it
([#993](https://github.com/Primitive-Labs/js-bao-wss/issues/993)).
:::

<<< ./snippets/integrations/get.swift#example{swift} [Swift]
