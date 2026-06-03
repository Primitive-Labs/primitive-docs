import JsBaoClient

// Mongo-style filtered query. The Swift `query()` returns the hydrated rows
// (`[Task]`) directly — there is no PaginatedResult wrapper.
func query(tasks: TypedModel<Task>) {
  // #region example
  let rows = tasks.query(["priority": ["$gte": 2], "completed": false])
  // #endregion example
  _ = rows
}
