import JsBaoClient

// Pass timing: true to get per-phase millisecond timings in result._timing.
// Works on every operation type.
func executeWithTiming(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let result = try await client.databases.executeOperation(
    databaseId: databaseId,
    name: "listTasks",
    options: ["params": ["projectId": "proj-1"], "timing": true]
  )
  // result._timing: { totalMs, databaseLookup, operationLookup, celEvaluation, ... }
  // #endregion example
  _ = result
}
