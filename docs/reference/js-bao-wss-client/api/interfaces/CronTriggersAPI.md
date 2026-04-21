[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CronTriggersAPI

# Interface: CronTriggersAPI

## Methods

### create()

> **create**(`params`): `Promise`\<[`CronTriggerInfo`](CronTriggerInfo.md)\>

Create a new cron trigger. The associated Durable Object is bound and
scheduled as part of this call.

#### Parameters

##### params

[`CreateCronTriggerParams`](CreateCronTriggerParams.md)

#### Returns

`Promise`\<[`CronTriggerInfo`](CronTriggerInfo.md)\>

***

### delete()

> **delete**(`triggerId`): `Promise`\<\{ `archived`: `boolean`; \}\>

Soft-delete (archive) a cron trigger and cancel its pending alarm.

#### Parameters

##### triggerId

`string`

#### Returns

`Promise`\<\{ `archived`: `boolean`; \}\>

***

### get()

> **get**(`triggerId`): `Promise`\<[`CronTriggerInfo`](CronTriggerInfo.md)\>

Get a cron trigger by id, including runtime state from the Durable Object.

#### Parameters

##### triggerId

`string`

#### Returns

`Promise`\<[`CronTriggerInfo`](CronTriggerInfo.md)\>

***

### list()

> **list**(): `Promise`\<[`CronTriggerListResult`](CronTriggerListResult.md)\>

List all cron triggers for the current app. Archived triggers are excluded.

#### Returns

`Promise`\<[`CronTriggerListResult`](CronTriggerListResult.md)\>

***

### pause()

> **pause**(`triggerId`): `Promise`\<[`CronTriggerInfo`](CronTriggerInfo.md)\>

Pause a trigger. The scheduled alarm is cancelled and no further runs
are started until the trigger is resumed.

#### Parameters

##### triggerId

`string`

#### Returns

`Promise`\<[`CronTriggerInfo`](CronTriggerInfo.md)\>

***

### resume()

> **resume**(`triggerId`): `Promise`\<[`CronTriggerInfo`](CronTriggerInfo.md)\>

Resume a paused or error_paused trigger. Clears lastError and
reschedules the next fire.

#### Parameters

##### triggerId

`string`

#### Returns

`Promise`\<[`CronTriggerInfo`](CronTriggerInfo.md)\>

***

### test()

> **test**(`triggerId`): `Promise`\<\{ `error?`: `string`; `instanceId?`: `string`; `runId?`: `string`; `started`: `boolean`; \}\>

Fire the associated workflow immediately without affecting the schedule.

#### Parameters

##### triggerId

`string`

#### Returns

`Promise`\<\{ `error?`: `string`; `instanceId?`: `string`; `runId?`: `string`; `started`: `boolean`; \}\>

***

### update()

> **update**(`triggerId`, `params`): `Promise`\<[`CronTriggerInfo`](CronTriggerInfo.md)\>

Update one or more fields of an existing cron trigger. Schedule-relevant
field changes (cron, timezone, state) are pushed to the Durable Object.

#### Parameters

##### triggerId

`string`

##### params

[`UpdateCronTriggerParams`](UpdateCronTriggerParams.md)

#### Returns

`Promise`\<[`CronTriggerInfo`](CronTriggerInfo.md)\>
