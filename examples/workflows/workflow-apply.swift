import JsBaoClient

// Register an apply handler so a client deterministically runs follow-up logic
// exactly once for a workflow with requiresClientApply = true. Register
// define() before start() so the apply can't arrive before the handler exists.
func defineApplyHandler(client: JsBaoClient) {
  // #region example
  client.workflows.define("my-workflow-key") { ctx in
    // Runs on exactly one connected client: the client claims the lease,
    // fetches the run output, calls this handler, then confirms the apply.
    // A thrown error releases the claim so another client (or a retry)
    // can pick it up.
    // ctx: workflowKey, runKey, runId, contextDocId?, output, startedByUserId?, meta?
    _ = ctx.output
  }
  // #endregion example
}
