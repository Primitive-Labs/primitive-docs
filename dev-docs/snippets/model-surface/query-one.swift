import JsBaoClient

// Swift has no `queryOne` on the model facade — take the first row of a
// sorted `query(...)` instead.
func queryOne() {
  // #region example
  let topTask = Task.query(
    ["completed": false],
    options: QueryOptions(sort: ["priority": -1])
  ).first
  // #endregion example
  _ = topTask
}
