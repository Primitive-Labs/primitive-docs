import JsBaoClient

// Load every record of this model. Rows that have drifted from the typed
// shape are dropped (the typed initializer returns nil for them).
func findAll(tasks: TypedModel<Task>) {
  // #region example
  let all = tasks.findAll()
  // #endregion example
  _ = all
}
