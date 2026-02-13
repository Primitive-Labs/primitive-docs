[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / WorkflowsAPI

# Interface: WorkflowsAPI

## Methods

### claimApply()

> **claimApply**(`options`): `Promise`\<[`ClaimApplyResult`](ClaimApplyResult.md)\>

Claim a workflow result for client-side apply. Returns { claimed: true } if this client won the lock.

#### Parameters

##### options

[`ClaimApplyOptions`](ClaimApplyOptions.md)

#### Returns

`Promise`\<[`ClaimApplyResult`](ClaimApplyResult.md)\>

***

### confirmApply()

> **confirmApply**(`options`): `Promise`\<[`ConfirmApplyResult`](ConfirmApplyResult.md)\>

Confirm that a claimed workflow result has been applied to the document.

#### Parameters

##### options

[`ConfirmApplyOptions`](ConfirmApplyOptions.md)

#### Returns

`Promise`\<[`ConfirmApplyResult`](ConfirmApplyResult.md)\>

***

### define()

> **define**(`workflowKey`, `options`): `void`

Define a workflow with its apply handler. Call once at app initialization so any client can handle apply.

#### Parameters

##### workflowKey

`string`

##### options

[`WorkflowDefineOptions`](WorkflowDefineOptions.md)

#### Returns

`void`

***

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

### releaseApply()

> **releaseApply**(`options`): `Promise`\<[`ReleaseApplyResult`](ReleaseApplyResult.md)\>

Release a claimed workflow apply so another client can retry. Called automatically on apply handler failure.

#### Parameters

##### options

[`ReleaseApplyOptions`](ReleaseApplyOptions.md)

#### Returns

`Promise`\<[`ReleaseApplyResult`](ReleaseApplyResult.md)\>

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
