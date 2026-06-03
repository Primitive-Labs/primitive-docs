import JsBaoClient

// Swift has no `queryOne` on the typed facade — take the first row of a
// sorted `query(...)` instead.
func queryOne(tasks: TypedModel<Task>) {
  // #region example
  let topTask = tasks.query(
    ["completed": false],
    options: QueryOptions(sort: ["priority": -1])
  ).first
  // #endregion example
  _ = topTask
}
