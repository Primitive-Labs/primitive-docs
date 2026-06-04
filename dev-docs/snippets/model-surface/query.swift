import JsBaoClient

// Mongo-style filtered query. The static `Task.query` returns the hydrated
// rows (`[Task]`) directly — there is no PaginatedResult wrapper. Reads span
// every open document by default.
func query() {
  // #region example
  let rows = Task.query(["priority": ["$gte": 2], "completed": false])
  // #endregion example
  _ = rows
}
