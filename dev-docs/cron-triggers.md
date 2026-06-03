# cronTriggers — `client.cronTriggers`

Schedule workflow runs on a standard 5-field cron expression and manage their lifecycle.

::: warning Swift parity gap
Every Swift `cronTriggers` method returns (and, for `create`/`update`, accepts) an
**untyped `[String: Any]`** where JS uses typed interfaces — `CronTriggerInfo`
(`get`/`create`/`update`/`pause`/`resume`), `CronTriggerListResult` (`list`),
`CreateCronTriggerParams` / `UpdateCronTriggerParams` (`create`/`update` params),
and the typed `{ archived }` (`delete`) / `{ started, runId?, … }` (`test`) results.
Both compile; on Swift you index fields by key, so required/enum fields and result
shapes are unenforced (sweep cron D1–D4,
[#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: warning Swift parity gap
Every Swift `cronTriggers` method silently casts a non-dict or decode-failed
response to an empty `[:]` (`result as? [String: Any] ?? [:]`) rather than
throwing, so a malformed body reads as a (misleadingly) **successful empty
result** — there is no equivalent silent-success path in JS (sweep cron D5;
no tracking issue filed — this is the behavioral contract, not the `[String: Any]`
typedness umbrella #954).
:::

## list()

List all cron triggers for the current app. Archived triggers are excluded.

::: code-group
<<< ./snippets/cron-triggers/list.ts#example{ts} [JavaScript]
<<< ./snippets/cron-triggers/list.swift#example{swift} [Swift]
:::

## get(triggerId)

Get a cron trigger by id, including runtime state from the Durable Object.

::: code-group
<<< ./snippets/cron-triggers/get.ts#example{ts} [JavaScript]
<<< ./snippets/cron-triggers/get.swift#example{swift} [Swift]
:::

## create(params)

Create a new cron trigger. The associated Durable Object is bound and scheduled as part of this call.

::: code-group
<<< ./snippets/cron-triggers/create.ts#example{ts} [JavaScript]
<<< ./snippets/cron-triggers/create.swift#example{swift} [Swift]
:::

## update(triggerId, params)

Update one or more fields of an existing cron trigger. Schedule-relevant changes (`cron`, `timezone`, `state`) are pushed to the Durable Object.

::: code-group
<<< ./snippets/cron-triggers/update.ts#example{ts} [JavaScript]
<<< ./snippets/cron-triggers/update.swift#example{swift} [Swift]
:::

## delete(triggerId)

Soft-delete (archive) a cron trigger and cancel its pending alarm.

::: code-group
<<< ./snippets/cron-triggers/delete.ts#example{ts} [JavaScript]
<<< ./snippets/cron-triggers/delete.swift#example{swift} [Swift]
:::

## pause(triggerId)

Pause a trigger. The scheduled alarm is cancelled and no further runs are started until the trigger is resumed.

::: code-group
<<< ./snippets/cron-triggers/pause.ts#example{ts} [JavaScript]
<<< ./snippets/cron-triggers/pause.swift#example{swift} [Swift]
:::

## resume(triggerId)

Resume a paused or `error_paused` trigger. Clears `lastError` and reschedules the next fire.

::: code-group
<<< ./snippets/cron-triggers/resume.ts#example{ts} [JavaScript]
<<< ./snippets/cron-triggers/resume.swift#example{swift} [Swift]
:::

## test(triggerId)

Fire the associated workflow immediately without affecting the schedule.

::: code-group
<<< ./snippets/cron-triggers/test.ts#example{ts} [JavaScript]
<<< ./snippets/cron-triggers/test.swift#example{swift} [Swift]
:::
