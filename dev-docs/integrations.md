# integrations — `client.integrations`

Proxy calls to configured third-party integrations through the server.

## call(request)

Call a third-party integration through the server proxy and unwrap the
upstream response.

::: warning Swift parity gap
JS `call<T>` is generic — the response `body` is typed `T`. Swift's
`IntegrationCallResponse.body` is `Any?`, so you cast at the call site (sweep
integrations D2, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: warning Swift parity gap
Swift's request shape is narrower and over-eager: `query` is `[String: String]`
only (JS accepts `Record<string, any>`), and `method`/`path` default to `"GET"`
/`""` and are always sent. JS omits them when unset so the server applies the
integration's configured `defaultMethod`/base path — so a Swift call that leaves
them unset can hit `DISALLOWED_METHOD` where the JS call succeeds
([#958](https://github.com/Primitive-Labs/js-bao-wss/issues/958)).
:::

::: code-group
<<< ./snippets/integrations/call.ts#example{ts} [JavaScript]
<<< ./snippets/integrations/call.swift#example{swift} [Swift]
:::

## list()

List the integrations configured for the current app.

::: warning No JavaScript equivalent
Swift-only — the JS `integrations` surface is `call`-only and exposes no catalog
`list()`. Sweep integrations D1 (Swift-added surface) — no tracking issue filed.
:::

<<< ./snippets/integrations/list.swift#example{swift} [Swift]

## get(integrationIdOrKey)

Fetch a single integration by id or key.

::: warning No JavaScript equivalent
Swift-only — the JS `integrations` surface is `call`-only and exposes no catalog
`get()`. Sweep integrations D1 (Swift-added surface) — no tracking issue filed.
:::

<<< ./snippets/integrations/get.swift#example{swift} [Swift]
