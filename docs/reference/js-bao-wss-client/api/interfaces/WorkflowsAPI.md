[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / WorkflowsAPI

# Interface: WorkflowsAPI

## Methods

### getStatus()

> **getStatus**(`options`): `Promise`\<[`WorkflowStatusResult`](WorkflowStatusResult.md)\>

Get the status of a workflow run. If contextDocId is not provided, uses the user's root document.

#### Parameters

##### options

[`GetWorkflowStatusOptions`](GetWorkflowStatusOptions.md)

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

> **start**(`options`): `Promise`\<[`StartWorkflowResult`](StartWorkflowResult.md)\>

Start a workflow and return the run information

#### Parameters

##### options

[`StartWorkflowOptions`](StartWorkflowOptions.md)

#### Returns

`Promise`\<[`StartWorkflowResult`](StartWorkflowResult.md)\>

***

### terminate()

> **terminate**(`options`): `Promise`\<[`WorkflowStatusResult`](WorkflowStatusResult.md)\>

Terminate a running workflow. If contextDocId is not provided, uses the user's root document.

#### Parameters

##### options

[`TerminateWorkflowOptions`](TerminateWorkflowOptions.md)

#### Returns

`Promise`\<[`WorkflowStatusResult`](WorkflowStatusResult.md)\>
