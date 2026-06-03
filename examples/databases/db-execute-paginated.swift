import JsBaoClient

// Execute a registered query operation with pagination controls. Callers may
// override limit/cursor/direction; the effective limit is min(definition, caller).
func listTasksPage(
  client: JsBaoClient,
  databaseId: String,
  previousCursor: String?
) async throws {
  // #region example
  var options: [String: Any] = [
    "params": ["projectId": "proj-1"],
    "limit": 10,
    "direction": 1, // 1 for forward, -1 for backward
  ]
  if let previousCursor { options["cursor"] = previousCursor }

  let result = try await client.databases.executeOperation(
    databaseId: databaseId,
    name: "listTasks",
    options: options
  )
  // result: { data: [...records], hasMore, nextCursor? }
  // #endregion example
  _ = result
}
