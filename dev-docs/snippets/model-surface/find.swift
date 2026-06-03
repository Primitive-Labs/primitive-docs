import JsBaoClient

// Look up a single record by its id. Returns nil when nothing matches (and
// also nil if the stored row has drifted from the typed shape).
func find(tasks: TypedModel<Task>, taskId: String) {
  // #region example
  let task = tasks.find(taskId)
  // #endregion example
  _ = task
}
