import JsBaoClient

// Load every record of this model across all open documents. Rows that have
// drifted from the typed shape are dropped (the typed initializer returns nil
// for them).
func findAll() {
  // #region example
  let all = Task.findAll()
  // #endregion example
  _ = all
}
