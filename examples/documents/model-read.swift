import JsBaoClient

// Read records: by id, by filter, the first match, and a count.
func readTasks() {
  // #region example
  // Find one by id
  let task = Task.find("task-id")

  // Query with filters
  let urgent = Task.query(["priority": ["$gte": 2], "completed": false])

  // First match (with a sort)
  let topTask = Task.query(
    ["completed": false],
    options: QueryOptions(sort: ["priority": -1])
  ).first

  // Count
  let remaining = Task.count(["completed": false])
  // #endregion example
  _ = (task, urgent, topTask, remaining)
}
