[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CreateCronTriggerParams

# Interface: CreateCronTriggerParams

## Properties

### cron

> **cron**: `string`

Standard 5-field cron expression.

***

### description?

> `optional` **description**: `string`

Optional human-readable description.

***

### displayName

> **displayName**: `string`

Display name shown in UIs.

***

### inputMapping?

> `optional` **inputMapping**: `any`

Additional mapped inputs; supports `{{now}}` template substitution.

***

### overlapPolicy?

> `optional` **overlapPolicy**: `"skip"` \| `"allow"`

What happens when a cron tick arrives while a prior run is still active. Default: "skip".

***

### rootInput?

> `optional` **rootInput**: `any`

Root input passed to the workflow on each fire.

***

### timezone?

> `optional` **timezone**: `string`

IANA timezone (e.g. "America/New_York"). Defaults to "UTC".

***

### triggerKey

> **triggerKey**: `string`

Unique per-app identifier (alphanumerics, hyphens, underscores).

***

### workflowKey

> **workflowKey**: `string`

Workflow key to invoke when the cron fires.
