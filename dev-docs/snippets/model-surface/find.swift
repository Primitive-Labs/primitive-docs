import JsBaoClient

// Look up a single record by its id across all open documents. Returns nil
// when nothing matches (and also nil if the stored row has drifted from the
// typed shape).
func find(taskId: String) {
  // #region example
  let task = Task.find(taskId)
  // #endregion example
  _ = task
}
