[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / RunSyncWorkflowOptions

# Interface: RunSyncWorkflowOptions

Options for synchronously running a workflow via `workflows.runSync` (#728).

## Properties

### contextDocId?

> `optional` **contextDocId**: `string`

Document ID to associate the run with. Defaults to the user's root document.

***

### input?

> `optional` **input**: `Record`\<`string`, `any`\>

Input data to pass to the workflow. Defaults to {} if not provided.

***

### meta?

> `optional` **meta**: `Record`\<`string`, `any`\>

User-defined metadata attached to the run (max 1KB). Returned in listRuns and runSync envelope.

***

### runKey?

> `optional` **runKey**: `string`

Key to identify this run (for idempotency). Auto-generated if not provided.

***

### signal?

> `optional` **signal**: `AbortSignal`

Optional AbortSignal. When fired before the workflow completes the
run resolves with `status: "terminated"`. The promise is rejected
only if the transport call itself is aborted before the request is
sent — completed work still resolves.

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Hard wall-clock ceiling in milliseconds. Defaults to 5000. Capped
server-side to 30000 (Workers CPU budget). When exceeded, the run
resolves with `status: "timeout"`.

***

### workflowKey

> **workflowKey**: `string`

The workflow key identifying which workflow to run.
