[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / StartWorkflowOptions

# Interface: StartWorkflowOptions

Options for starting a workflow

## Properties

### contextDocId?

> `optional` **contextDocId**: `string`

Document ID to associate the run with

***

### forceRerun?

> `optional` **forceRerun**: `boolean`

If true, terminates any existing run with the same runKey and starts a new one

***

### input?

> `optional` **input**: `Record`\<`string`, `any`\>

Input data to pass to the workflow. Defaults to {} if not provided.

***

### meta?

> `optional` **meta**: `Record`\<`string`, `any`\>

User-defined metadata attached to the run (max 1KB). Returned in listRuns and getStatus.

***

### runKey?

> `optional` **runKey**: `string`

Key to identify this run (for idempotency). Auto-generated if not provided.

***

### workflowKey

> **workflowKey**: `string`

The workflow key identifying which workflow to start
