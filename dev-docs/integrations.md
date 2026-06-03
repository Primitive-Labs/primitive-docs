# integrations — `client.integrations`

Proxy calls to configured third-party integrations through the server.

## call(request)

Call a third-party integration through the server proxy and unwrap the
upstream response.

::: tip Divergent shape
JS `call<T>` is generic — the response `body` is typed `T` and `query` accepts
`Record<string, any>`. Swift's `IntegrationCallResponse.body` is `Any?` (cast at
the call site) and `query` is `[String: String]` only ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/integrations/call.ts#example{ts} [JavaScript]
<<< ./snippets/integrations/call.swift#example{swift} [Swift]
:::

## list()

List the integrations configured for the current app.

::: warning No JavaScript equivalent
Swift-only — the JS client doesn't expose a catalog `list()` ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

<<< ./snippets/integrations/list.swift#example{swift} [Swift]

## get(integrationIdOrKey)

Fetch a single integration by id or key.

::: warning No JavaScript equivalent
Swift-only — the JS client doesn't expose a catalog `get()` ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

<<< ./snippets/integrations/get.swift#example{swift} [Swift]
