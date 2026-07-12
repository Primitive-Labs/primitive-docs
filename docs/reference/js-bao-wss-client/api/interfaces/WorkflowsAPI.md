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

### getPendingApplies()

> **getPendingApplies**(`options`): `Promise`\<`any`[]\>

Fetch pending workflow applies for a document.

#### Parameters

##### options

###### contextDocId

`string`

#### Returns

`Promise`\<`any`[]\>

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

### listStepRuns()

> **listStepRuns**(`options`): `Promise`\<[`ListWorkflowStepRunsResult`](ListWorkflowStepRunsResult.md)\>

List step runs for a specific workflow run. The run must have been started by the current user.

#### Parameters

##### options

[`ListWorkflowStepRunsOptions`](ListWorkflowStepRunsOptions.md)

#### Returns

`Promise`\<[`ListWorkflowStepRunsResult`](ListWorkflowStepRunsResult.md)\>

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

### runSync()

> **runSync**\<`I`, `O`\>(`options`): `Promise`\<[`RunSyncWorkflowResult`](RunSyncWorkflowResult.md)\<`O`\>\>

Synchronously invoke a workflow and wait for the final result.

Only callable on workflows marked `syncCallable: true` in their
server-side definition (issue #728). Use this for low-latency,
short-task workflows. Long-running workflows should keep using
`start()` plus the WebSocket / polling lifecycle.

The promise **resolves** with the final envelope for every outcome,
including engine failure and timeout — failure surfaces as
`status: "failed"` (or `"timeout"` / `"terminated"`), not a thrown
error. Network / transport errors still reject as usual.

The optional generics `I` (input) and `O` (`output`) type the payload and
the result envelope (issue #1442). Both are additive and default to today's
untyped `Record<string, any>` / `any`, so existing callers are unaffected.
The generated per-workflow `<key>(client)` factory supplies them from the
workflow's `inputSchema`/`outputSchema`.

#### Type Parameters

##### I

`I` = `Record`\<`string`, `any`\>

##### O

`O` = `any`

#### Parameters

##### options

`Omit`\<[`RunSyncWorkflowOptions`](RunSyncWorkflowOptions.md), `"input"`\> & `object`

#### Returns

`Promise`\<[`RunSyncWorkflowResult`](RunSyncWorkflowResult.md)\<`O`\>\>

***

### start()

> **start**\<`I`\>(`options`): `Promise`\<[`StartWorkflowResult`](StartWorkflowResult.md)\>

Start a workflow and return the run information.

The optional generic `I` types the `input` payload (issue #1442). It is
additive and defaults to today's untyped `Record<string, any>`, so existing
callers that pass no type argument are unaffected. The generated per-workflow
`<key>(client)` factory (`primitive workflows codegen`) supplies it from the
workflow's `inputSchema`.

#### Type Parameters

##### I

`I` = `Record`\<`string`, `any`\>

#### Parameters

##### options

`Omit`\<[`StartWorkflowOptions`](StartWorkflowOptions.md), `"input"`\> & `object`

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
