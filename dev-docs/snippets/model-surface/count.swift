import JsBaoClient

// Count records matching a filter across all open documents. Returns an `Int`.
func count() {
  // #region example
  let remaining = Task.count(["completed": false])
  // #endregion example
  _ = remaining
}
