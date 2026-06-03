import JsBaoClient

// Combine conditions with logical operators ($or, $and).
func queryLogical(tasks: TypedModel<Task>) {
  // #region example
  let result = tasks.query([
    "$or": [
      ["priority": 3],
      ["dueDate": ["$lt": "2026-06-02T00:00:00Z"]],
    ],
  ])
  // #endregion example
  _ = result
}
