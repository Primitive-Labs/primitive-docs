# workflows — `client.workflows`

Run server-side workflows and drive the client-side apply lifecycle. A run is
started by `workflowKey` and identified by a `runKey` (idempotency key); both
clients scope work to a `contextDocId` (defaults to the user's root document).

Workflows defined with client-apply park in `apply_pending` when they finish:
the server holds the output and waits for a client to claim a short lease, run
its apply handler, and confirm. The low-level lease methods (`claimApply` /
`confirmApply` / `releaseApply` / `getPendingApplies`) are shared across both
SDKs; `define` registers an auto-apply handler that runs that sequence for you.

## start(options)

Start a workflow run and get back `{ runId, runKey, status, existing }`. In
Swift, `input` is a positional `[String: Any]` and the idempotency/scoping
fields live on `StartWorkflowOptions`.

Swift flattens the JS options object: `input` is a positional `[String: Any]`
and the remaining idempotency/scoping fields move onto `StartWorkflowOptions`.
A single-object overload (`start(_ options: StartWorkflowOptions)`) is also
available, mirroring the JS options-object call.

::: code-group
<<< ./snippets/workflows/start.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/start.swift#example{swift} [Swift]
:::

## runSync(options)

Synchronously invoke a workflow and await its final envelope in one call. Only
valid for workflows marked `syncCallable: true`. Every non-transport outcome
**resolves** (failure / timeout surface as `status`, not a throw); only
connectivity / abort-before-send errors reject.

::: code-group
<<< ./snippets/workflows/run-sync.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/run-sync.swift#example{swift} [Swift]
:::

## getStatus(options)

Poll the status of a run. Returns a `WorkflowStatusResult`
(`status` / `output` / `error` / `run`).

::: code-group
<<< ./snippets/workflows/get-status.ts#example{ts} [JavaScript]
<<< ./snippets/workflows/get-status.swift#example{swift} [Swift]
:::

## terminate(options)

Terminate a running workflow. Pass the same `contextDocId` the run was started
with so the server can route to the right per-document instance.

Swift takes `contextDocId` as a third optional positional parameter
(`terminate(workflowKey:runKey:contextDocId:)`, defaulting to `nil`), or via a
single-object overload (`terminate(_ options: TerminateWorkflowOptions)`)
mirroring the JS options-object call. The example omits it; supply it for runs
started with a `contextDocId`.

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
