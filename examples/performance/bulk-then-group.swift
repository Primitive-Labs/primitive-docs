import JsBaoClient

// Replace an N+1 (one per-item op call per parent) with ONE bulk query, then
// group the rows client-side. The bulk op carries no per-parent filter; the
// grouping happens in memory instead of in N round trips.
func tasksByCategory(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let all = try await client.databases.executeOperation(databaseId: databaseId, name: "listAllTasks")
  var byCategory: [String: [JSONValue]] = [:]
  for task in all["data"]?.arrayValue ?? [] {
    let key = task["category"]?.stringValue ?? "uncategorized"
    byCategory[key, default: []].append(task)
  }
  // #endregion example
  _ = byCategory
}
