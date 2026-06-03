# analytics — `client.analytics`

Emit custom analytics events and control the analytics pipeline.

::: tip Divergent shape
Swift flattens the analytics surface onto the client (`client.logAnalyticsEvent(...)`,
`client.flushAnalytics()`) and takes an **untyped `[String: Any]`** where JS uses the typed
`client.analytics.logEvent({ ... })`. Both compile; the shapes differ ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), [#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963)).
:::

## logEvent(event)

Emit a custom analytics event. `action` and `user_ulid` are required.

::: code-group
<<< ./snippets/analytics/log-event.ts#example{ts} [JavaScript]
<<< ./snippets/analytics/log-event.swift#example{swift} [Swift]
:::

## flush()

Force-flush the buffered analytics queue immediately.

::: code-group
<<< ./snippets/analytics/flush.ts#example{ts} [JavaScript]
<<< ./snippets/analytics/flush.swift#example{swift} [Swift]
:::

## logSnapshot(context?)

Emit a snapshot event with arbitrary context.

::: warning No Swift equivalent
JavaScript-only — the Swift client has no `logSnapshot` ([#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963)).
:::

<<< ./snippets/analytics/log-snapshot.ts#example{ts} [JavaScript]
