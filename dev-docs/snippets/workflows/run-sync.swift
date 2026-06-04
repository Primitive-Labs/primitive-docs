import JsBaoClient

// Synchronously invoke a workflow and await its final envelope in one call.
// Every non-transport outcome RESOLVES (failure/timeout surface as `status`,
// not a throw); only connectivity errors throw.
func runSync(client: JsBaoClient, workflowKey: String, contextDocId: String) async throws {
  // #region example
  let result = try await client.workflows.runSync(
    workflowKey: workflowKey,
    input: ["topic": "spring planting"],
    contextDocId: contextDocId,
    timeoutMs: 5000
  )
  if result.status == "completed" {
    // result.output is the final workflow output (JSONValue?)
  }
  // status: "completed" | "failed" | "terminated" | "timeout" | "apply_pending"
  // #endregion example
  _ = result
}
