[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / WorkflowRun

# Interface: WorkflowRun

A workflow run record

## Properties

### contextDocId?

> `optional` **contextDocId**: `string`

***

### endedAt?

> `optional` **endedAt**: `string`

***

### errorMessage?

> `optional` **errorMessage**: `string` \| `null`

Error message when `status` is `"failed"`, `null` otherwise. Always
 present in run responses (the server sends `errorMessage || null`).

***

### instanceId

> **instanceId**: `string`

***

### meta?

> `optional` **meta**: `Record`\<`string`, `any`\>

User-defined metadata (max 1KB)

***

### revisionId

> **revisionId**: `string`

***

### runId

> **runId**: `string`

***

### runKey

> **runKey**: `string`

***

### startedAt?

> `optional` **startedAt**: `string`

ISO timestamp stamped when the run started. Emitted by all run
 serializers (the model field is `required`); optional here only to
 tolerate hypothetical legacy records written before the field existed.

***

### status

> **status**: [`WorkflowRunStatus`](../type-aliases/WorkflowRunStatus.md)

***

### workflowId

> **workflowId**: `string`

***

### workflowKey

> **workflowKey**: `string`
