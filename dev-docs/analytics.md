# analytics — `client.analytics`

Emit custom analytics events and control the analytics pipeline.

::: warning Swift parity gap
There is no `client.analytics` namespace in Swift. The surface is flattened onto the client as four
mis-named, **untyped `[String: Any]`** methods (`client.logAnalyticsEvent(...)`, `client.flushAnalytics()`,
`client.setAnalyticsPlanOverride(...)`, `client.setAnalyticsAppVersionOverride(...)`) where JS uses the
typed `client.analytics.logEvent({ ... })` namespace, and Swift has no `logSnapshot`
([#951](https://github.com/Primitive-Labs/js-bao-wss/issues/951), [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), [#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963)).
:::

::: warning Swift parity gap — client-side auto-events do NOT fire (P0)
Lifecycle auto-events that JS emits automatically (`boot`, `dailyAuth`, `returnActive`,
`firstDocOpen`/`firstDocEdit`, `offlineRecovery`, `syncErrors`, `blobUploads`, `serviceWorker`,
`sessionEnd`, `llm`/`gemini`) are **not emitted by the Swift client at all** — it ships zero
client-side auto-event instrumentation, and the `analyticsAutoEvents` config option that gates them in
JS does not exist on Swift `JsBaoClientOptions` (the persistence record exists but nothing fires it).
Any "enabled by default / fires automatically" framing applies to **JavaScript only**; iOS gets a
silent product-analytics blackout for everything except events you `logEvent` by hand
([#951](https://github.com/Primitive-Labs/js-bao-wss/issues/951), [#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963)).
:::

## logEvent(event)

Emit a custom analytics event. `action` and `user_ulid` are required.

::: warning Swift parity gap
"Required" holds for JS only. JS takes a typed object (`client.analytics.logEvent({ action, user_ulid, … })`)
where the compiler enforces the required keys; Swift takes an untyped `[String: Any]`
(`client.logAnalyticsEvent([...])`) with no compile-time check, so a missing `action`/`user_ulid` is
not caught (sweep analytics D5; [#951](https://github.com/Primitive-Labs/js-bao-wss/issues/951)).
:::

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
JavaScript-only — the Swift client has no `logSnapshot` (and no `client.analytics` namespace to hang it on) ([#951](https://github.com/Primitive-Labs/js-bao-wss/issues/951), [#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963)).
:::

<<< ./snippets/analytics/log-snapshot.ts#example{ts} [JavaScript]
