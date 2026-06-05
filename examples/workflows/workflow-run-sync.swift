import JsBaoClient

// Run a syncCallable workflow and await its terminal result in one round-trip.
func validateCoupon(client: JsBaoClient, code: String) async throws {
  // #region example
  let result = try await client.workflows.runSync(
    workflowKey: "validate-coupon",
    input: ["code": code],
    timeoutMs: 5000 // default 5000; server caps at 30000
  )
  // RunSyncWorkflowResult: runId, runKey, status, output?, error?, run?, existing?
  // status: "completed" | "failed" | "terminated" | "timeout" | "apply_pending"
  // Resolves for every terminal outcome — only transport errors throw.
  if result.status == "completed" {
    print(result.output ?? "")
  }
  // #endregion example
  _ = result
}
