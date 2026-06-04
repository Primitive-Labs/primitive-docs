# workflows — `client.workflows`

Run server-side workflows and drive the client-side apply lifecycle. A run is
started by `workflowKey` and identified by a `runKey` (idempotency key); both
clients scope work to a `contextDocId` (defaults to the user's root document).

Workflows defined with client-apply park in `apply_pending` when they finish:
the server holds the output and waits for a client to claim a short lease, run
its apply handler, and confirm. The low-level lease methods (`claimApply` /
`confirmApply` / `releaseApply` / `getPendingApplies`) are shared across both
SDKs; `define` registers an auto-apply handler that runs that sequence for you.

::: tip Now typed
The Swift `workflows` methods now return typed result structs that mirror the JS
ones field-for-field — `StartWorkflowResult`, `WorkflowStatusResult`,
`ListWorkflowRunsResult`, `ListWorkflowStepRunsResult`, `ClaimApplyResult`,
`ConfirmApplyResult`, `ReleaseApplyResult`, and `[PendingApplyInfo]` — instead of
`[String: Any]`. Read fields with dot access (`result.runId`,
`status.normalizedStatus`). Opaque blobs (`output`, `meta`, step `config` /
`input`, …) are `JSONValue?`. A malformed response body now **throws** on decode
rather than coercing to an empty `[:]`
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954),
[#991](https://github.com/Primitive-Labs/js-bao-wss/issues/991)).
:::

## start(options)

Start a workflow run and get back `{ runId, runKey, status, existing }`. In
Swift, `input` is a positional `[String: Any]` and the idempotency/scoping
fields live on `StartWorkflowOptions`.

::: tip Divergent shape
Swift flattens the JS options object: `input` is a positional `[String: Any]`
and the remaining idempotency/scoping fields move onto `StartWorkflowOptions`.
This positional-args-mirror-JS-options shape is the convention across the Swift
workflows surface (`define` / `listStepRuns` / `getStatus` / `meta`) and is
expected, not a gap (sweep workflows D3,
[#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: warning Swift parity gap
The `WorkflowStartedEvent` that follows `start` carries only
`{ workflowKey, runId }` in Swift, vs the JS event's full 8-field payload — so
Swift subscribers can't read the other fields off the start event (sweep
workflows D2, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/workflows/start.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/start.swift#example{swift} [Swift]
:::

## runSync(options)

Synchronously invoke a workflow and await its final envelope in one call. Only
valid for workflows marked `syncCallable: true`. Every non-transport outcome
**resolves** (failure / timeout surface as `status`, not a throw); only
connectivity / abort-before-send errors reject.

::: warning No Swift equivalent
JavaScript-only — the Swift client has no `runSync`. Swift callers use the
`start` + `awaitRun` (or `runAndApply`) orchestration instead
([#956](https://github.com/Primitive-Labs/js-bao-wss/issues/956)).
:::

<<< ./snippets/workflows/run-sync.ts#example{ts} [JavaScript]

## getStatus(options)

Poll the status of a run. The Swift envelope adds a `normalizedStatus` field
that reconciles the Cloudflare-workflow and DB status shapes.

::: tip Divergent shape
`normalizedStatus` is Swift-only — JS `getStatus` returns `WorkflowStatusResult`
with no such field, so code that reads `status.normalizedStatus` won't port
across clients. It's a Swift-side convenience (reconciles the CF-workflow and DB
status shapes), not a JS gap.
:::

::: code-group
<<< ./snippets/workflows/get-status.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/get-status.swift#example{swift} [Swift]
:::

## terminate(options)

Terminate a running workflow. Pass the same `contextDocId` the run was started
with so the server can route to the right per-document instance.

::: tip Divergent shape
JS carries `contextDocId` inside the `TerminateWorkflowOptions` object; Swift
takes it as a third optional positional parameter
(`terminate(workflowKey:runKey:contextDocId:)`, defaulting to `nil`). The
example omits it; supply it for runs started with a `contextDocId`.
:::

::: code-group
<<< ./snippets/workflows/terminate.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/terminate.swift#example{swift} [Swift]
:::

## listRuns(options?)

List runs for the current user, with optional filtering (`workflowKey`,
`status`, `contextDocId`) and cursor pagination.

::: tip Divergent shape
JS passes the filters as a flat inline object (`listRuns({ workflowKey, status,
limit })`); Swift wraps them in a named `ListWorkflowRunsOptions` struct passed
as `options:`. Same fields, different call shape — consistent with the Swift
workflows options-struct convention.
:::

::: code-group
<<< ./snippets/workflows/list-runs.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/list-runs.swift#example{swift} [Swift]
:::

## listStepRuns(options)

List the per-step records for one run — input, output, error, and timing for
each step. Useful for debugging UIs.

::: code-group
<<< ./snippets/workflows/list-step-runs.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/list-step-runs.swift#example{swift} [Swift]
:::

## claimApply(options)

Claim the apply lease for a run parked in `apply_pending`. The server grants a
30-second lease; `claimed` is `false` (with a `reason`) if another client
already holds it.

::: code-group
<<< ./snippets/workflows/claim-apply.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/claim-apply.swift#example{swift} [Swift]
:::

## confirmApply(options)

Confirm a claimed apply once the output has been written to the document,
transitioning the run from `apply_claimed` to `completed`. Conditional on the
same connection that claimed it.

::: code-group
<<< ./snippets/workflows/confirm-apply.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/confirm-apply.swift#example{swift} [Swift]
:::

## releaseApply(options)

Release a claimed apply so another client can retry, sending the run back to
`apply_pending`. Called automatically when an apply handler fails.

::: code-group
<<< ./snippets/workflows/release-apply.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/release-apply.swift#example{swift} [Swift]
:::

## getPendingApplies(options)

Fetch runs awaiting client-side apply for a document. Useful on reconnect to
recover applies whose events were missed while offline. JS takes
`{ contextDocId }`; Swift takes a plain `contextDocId` string.

::: code-group
<<< ./snippets/workflows/get-pending-applies.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/get-pending-applies.swift#example{swift} [Swift]
:::

## define(workflowKey, options)

Register an apply handler. Call once at app init; the client runs the
claim → handler → confirm sequence automatically when a matching run completes
with `needsApply`. JS passes `{ onApply }`; Swift passes a trailing closure
that receives a typed `WorkflowApplyContext`.

::: code-group
<<< ./snippets/workflows/define.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/define.swift#example{swift} [Swift]
:::

## Swift-only orchestration helpers

The Swift client adds higher-level, run-scoped helpers on top of the shared
apply lifecycle. These are **Swift-only by design** — JS expresses the same
flows through `runSync`, the `workflowStatus` event, and the single-handler
`define` model, so they are not parity gaps (see
[crosswalk](https://github.com/Primitive-Labs/primitive-docs/blob/docs-parity-jun-3/swift-parity-crosswalk.md), Workflows: "Swift-only orchestration").

### runAndApply(workflowKey:input:options:timeout:)

Start a workflow and await its applied output in one call. Tracks each
invocation by `runKey`, so N parallel runs of the same key coexist (unlike the
single-handler `define`). Terminal non-success statuses throw
`WorkflowsAPI.WorkflowRunError`; missed output throws `.timedOut`.

<<< ./snippets/workflows/run-and-apply.swift#example{swift} [Swift]

### awaitRun(workflowKey:runKey:contextDocId:timeout:)

Reconnect to an existing run and await its output. Use on app resume or
document reopen to pick up a run started in a previous session; resolves across
`apply_pending` / `running` / `completed` states.

<<< ./snippets/workflows/await-run.swift#example{swift} [Swift]

### recheckPendingRuns()

Re-check every registered per-run waiter against the server's current state.
Call after reconnect to pick up applies whose `workflowStatus` events were
missed while offline.

<<< ./snippets/workflows/recheck-pending-runs.swift#example{swift} [Swift]

### deliverPendingApplies(contextDocId:)

Fetch any pending applies for a document and run them through the registered
`define` handlers. Call after reconnect or when a document is opened.

<<< ./snippets/workflows/deliver-pending-applies.swift#example{swift} [Swift]

### undefine(workflowKey)

Drop a previously-registered apply handler.

<<< ./snippets/workflows/undefine.swift#example{swift} [Swift]
