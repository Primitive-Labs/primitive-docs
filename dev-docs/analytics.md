# analytics — `client.analytics`

Emit custom analytics events and control the analytics pipeline. Both clients
expose a typed `client.analytics` namespace backed by a buffering queue that
batches events, rate-limits, persists across launches, and flushes on connect.

The queue stamps each event with the signed-in `user_ulid` (falling back to the
`UNAUTHENTICATED` sentinel), a timestamp, and any `plan` / `app_version`
overrides, then sends batches over the WebSocket once connected.

Auto-events fire on both clients, gated by the `analyticsAutoEvents` config on
`JsBaoClientOptions`: `session_end`, `dailyAuth`, `returnActive`, `syncErrors`,
`blobUploads`, and the `llm`/`gemini` call-path events. (`boot`/`firstDocOpen`/
`firstDocEdit`/`offlineRecovery` are no-ops in current JS, so Swift doesn't emit
them either; `serviceWorker` is browser-only.)

## logEvent(event)

Emit a custom analytics event. `action` is required; `user_ulid` is filled from
the signed-in user when omitted.

::: tip Divergent shape
JS takes an inline typed object (`client.analytics.logEvent({ action, … })`);
Swift takes a typed `AnalyticsEventInput` struct with the same snake_case fields
(`client.analytics.logEvent(AnalyticsEventInput(action: …))`). Same fields,
compile-time-checked on both sides.
:::

::: code-group
<<< ./snippets/analytics/log-event.ts#example{ts} [JavaScript]
<<< ./snippets/analytics/log-event.swift#example{swift} [Swift]
:::

## logSnapshot(context?)

Emit a snapshot event (`action: "_snapshot"`, `feature: "_state"`) with
arbitrary context. No-ops when there is no signed-in user.

::: code-group
<<< ./snippets/analytics/log-snapshot.ts#example{ts} [JavaScript]
<<< ./snippets/analytics/log-snapshot.swift#example{swift} [Swift]
:::

## flush()

Force-flush the buffered analytics queue immediately. Also runs automatically on
(re)connect and, on iOS, when the app backgrounds or terminates.

::: code-group
<<< ./snippets/analytics/flush.ts#example{ts} [JavaScript]
<<< ./snippets/analytics/flush.swift#example{swift} [Swift]
:::

## setPlanOverride(plan) / setAppVersionOverride(version)

Override the `plan` and `app_version` fields stamped on every subsequent event.
Pass `null` (JS) / `nil` (Swift) to clear an override.

::: code-group
<<< ./snippets/analytics/overrides.ts#example{ts} [JavaScript]
<<< ./snippets/analytics/overrides.swift#example{swift} [Swift]
:::
