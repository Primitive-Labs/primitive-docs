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

### meta?

> `optional` **meta**: `Record`\<`string`, `any`\>

Additional metadata to pass to the workflow

***

### runKey?

> `optional` **runKey**: `string`

Key to identify this run (for idempotency). Auto-generated if not provided.
