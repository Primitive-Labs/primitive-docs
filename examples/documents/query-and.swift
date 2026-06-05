import JsBaoClient

// Plain field maps AND together — every condition must match.
func queryAnd() {
  // #region example
  let result = Task.query([
    "completed": false,
    "priority": ["$gte": 3],
    "category": ["$in": ["work", "urgent"]],
  ])
  // #endregion example
  _ = result
}
