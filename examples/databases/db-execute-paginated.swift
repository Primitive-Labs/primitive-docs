import JsBaoClient

// Execute a registered query operation with pagination controls. Callers may
// override limit/cursor/direction; the effective limit is min(definition, caller).
func listTasksPage(
  client: JsBaoClient,
  databaseId: String,
  previousCursor: String?
) async throws {
  // #region example
  let result = try await client.databases.executeOperation(
    databaseId: databaseId,
    name: "listTasks",
    options: ExecuteOperationOptions(
      params: ["projectId": "proj-1"],
      limit: 10,
      cursor: previousCursor,
      direction: .ascending // forward; use .descending to page backward
    )
  )
  // result: { data: [...records], hasMore, nextCursor? }
  // #endregion example
  _ = result
}
