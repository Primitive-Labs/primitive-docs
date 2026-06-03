import JsBaoClient

// Fire the associated workflow immediately without affecting the schedule.
// Swift returns an untyped `[String: Any]` (JS returns a typed
// `{ started, runId?, instanceId?, error? }`).
func test(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let result = try await client.cronTriggers.test(triggerId: triggerId)
  let started = result["started"] as? Bool ?? false
  let runId = result["runId"] as? String
  // #endregion example
  _ = (started, runId)
}
