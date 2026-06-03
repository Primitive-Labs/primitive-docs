import JsBaoClient

// Read records: by id, by filter, the first match, and a count.
func readTasks(tasks: TypedModel<Task>) {
  // #region example
  // Find one by id
  let task = tasks.find("task-id")

  // Query with filters
  let urgent = tasks.query(["priority": ["$gte": 2], "completed": false])

  // First match (with a sort)
  let topTask = tasks.query(
    ["completed": false],
    options: QueryOptions(sort: ["priority": -1])
  ).first

  // Count
  let remaining = tasks.dynamic.count(["completed": false])
  // #endregion example
  _ = (task, urgent, topTask, remaining)
}
