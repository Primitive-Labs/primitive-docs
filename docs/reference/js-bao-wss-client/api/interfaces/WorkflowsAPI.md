[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / WorkflowsAPI

# Interface: WorkflowsAPI

## Methods

### getStatus()

> **getStatus**(`workflowKey`, `runKey`, `contextDocId?`): `Promise`\<[`WorkflowStatusResult`](WorkflowStatusResult.md)\>

Get the status of a workflow run. If contextDocId is not provided, uses the user's root document.

#### Parameters

##### workflowKey

`string`

##### runKey

`string`

##### contextDocId?

`string`

#### Returns

`Promise`\<[`WorkflowStatusResult`](WorkflowStatusResult.md)\>

***

### listRuns()

> **listRuns**(`options?`): `Promise`\<[`ListWorkflowRunsResult`](ListWorkflowRunsResult.md)\>

List workflow runs for the current user

#### Parameters

##### options?

[`ListWorkflowRunsOptions`](ListWorkflowRunsOptions.md)

#### Returns

`Promise`\<[`ListWorkflowRunsResult`](ListWorkflowRunsResult.md)\>

***

### start()

> **start**(`workflowKey`, `input`, `options?`): `Promise`\<[`StartWorkflowResult`](StartWorkflowResult.md)\>

Start a workflow and return the run information

#### Parameters

##### workflowKey

`string`

##### input

`Record`\<`string`, `any`\>

##### options?

[`StartWorkflowOptions`](StartWorkflowOptions.md)

#### Returns

`Promise`\<[`StartWorkflowResult`](StartWorkflowResult.md)\>

***

### terminate()

> **terminate**(`workflowKey`, `runKey`, `contextDocId?`): `Promise`\<[`WorkflowStatusResult`](WorkflowStatusResult.md)\>

Terminate a running workflow. If contextDocId is not provided, uses the user's root document.

#### Parameters

##### workflowKey

`string`

##### runKey

`string`

##### contextDocId?

`string`

#### Returns

`Promise`\<[`WorkflowStatusResult`](WorkflowStatusResult.md)\>
