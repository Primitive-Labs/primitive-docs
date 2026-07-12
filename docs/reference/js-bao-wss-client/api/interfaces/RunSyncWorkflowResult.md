[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / RunSyncWorkflowResult

# Interface: RunSyncWorkflowResult\<O\>

Result envelope from `workflows.runSync`. All non-transport outcomes
resolve with this shape — promise rejection is reserved for
connectivity / abort-before-send errors.

## Type Parameters

### O

`O` = `any`

## Properties

### error?

> `optional` **error**: `string`

Error message when `status === "failed"`.

***

### existing?

> `optional` **existing**: `boolean`

True if the runKey matched an existing run; no new execution occurred.

***

### output?

> `optional` **output**: `O`

Final output of the workflow, when `status === "completed"`.

***

### run?

> `optional` **run**: [`WorkflowRun`](WorkflowRun.md)

Persisted `WorkflowRun` row for the call (always present on success).

***

### runId

> **runId**: `string`

***

### runKey

> **runKey**: `string`

***

### status

> **status**: `string`

Terminal status from the run.
- "completed" — workflow finished without error
- "failed" — engine raised an error (see `error`)
- "terminated" — caller-side AbortSignal fired mid-execution
- "timeout" — server-side timeout ceiling tripped
- "apply_pending" — workflow needs the client-side apply step
