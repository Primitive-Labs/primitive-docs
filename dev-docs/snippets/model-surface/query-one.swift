import JsBaoClient

// Fetch just the first match (with an optional sort). `queryOne` mirrors the
// JS client and resolves to `nil` when nothing matches.
func queryOne() {
  // #region example
  let topTask = Task.queryOne(
    ["completed": false],
    options: QueryOptions(sort: ["priority": -1])
  )
  // #endregion example
  _ = topTask
}
