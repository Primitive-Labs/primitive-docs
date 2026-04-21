[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / WorkflowStepRunRecord

# Interface: WorkflowStepRunRecord

A persisted step run record with debugging data

## Properties

### config?

> `optional` **config**: `any`

Rendered step config (after template evaluation)

***

### context?

> `optional` **context**: `any`

Snapshot of input and previous step outputs at the time this step ran

***

### durationMs?

> `optional` **durationMs**: `number`

***

### endedAt?

> `optional` **endedAt**: `string`

***

### error?

> `optional` **error**: `string` \| `null`

Error message if the step failed

***

### errorDetails?

> `optional` **errorDetails**: `any`

Structured error details (stack trace, cause chain) if the step failed

***

### input?

> `optional` **input**: `any`

Resolved input to the step

***

### inputTokens?

> `optional` **inputTokens**: `number`

***

### output?

> `optional` **output**: `any`

Output from the step

***

### outputTokens?

> `optional` **outputTokens**: `number`

***

### rawConfig?

> `optional` **rawConfig**: `any`

Original step config before template rendering (for transform steps)

***

### retryCount?

> `optional` **retryCount**: `number`

***

### runId

> **runId**: `string`

***

### startedAt?

> `optional` **startedAt**: `string`

***

### status

> **status**: `string`

completed | failed | skipped

***

### stepId

> **stepId**: `string`

***

### stepIndex

> **stepIndex**: `number`

***

### stepKind

> **stepKind**: `string`

***

### stepRunId

> **stepRunId**: `string`

***

### templateWarnings?

> `optional` **templateWarnings**: `any`

Template warnings captured during step execution

***

### totalTokens?

> `optional` **totalTokens**: `number`
