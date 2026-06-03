import JsBaoClient

// Register an apply handler. Call once at app init; the client runs the
// claim -> handler -> confirm sequence automatically when a run completes
// with needsApply. The handler receives a typed `WorkflowApplyContext`.
func define(client: JsBaoClient, workflowKey: String) {
  // #region example
  client.workflows.define(workflowKey) { ctx in
    // write `ctx.output` into the document, keyed by ctx.runKey / ctx.contextDocId
    print("applying", ctx.runKey, ctx.output as Any, ctx.contextDocId as Any)
  }
  // #endregion example
}
