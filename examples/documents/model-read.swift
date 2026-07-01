import JsBaoClient

// Read records: by id, by filter, the first match, and a count.
func readTasks() async throws {
  // #region example
  // Find one by id (async throws — find/findAll require await)
  let task = try await Task.find("task-id")

  // Query with filters (synchronous — query/count/queryOne are synchronous)
  let urgent = try Task.query(["priority": ["$gte": 2], "completed": false])

  // First match (with a sort)
  let topTask = try Task.query(
    ["completed": false],
    options: QueryOptions(sort: ["priority": -1])
  ).first

  // Count
  let remaining = try Task.count(["completed": false])
  // #endregion example
  _ = (task, urgent, topTask, remaining)
}
