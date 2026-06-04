import JsBaoClient

// Fire the associated workflow immediately without affecting the schedule.
func test(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let result = try await client.cronTriggers.test(triggerId: triggerId)
  let started = result.started
  let runId = result.runId
  // #endregion example
  _ = (started, runId)
}
