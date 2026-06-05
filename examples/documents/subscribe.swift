import JsBaoClient

// Subscribe to model changes (local edits and synced remote edits). Returns an
// unsubscribe closure — always call it when you're done.
func watchTasks() {
  // #region example
  let unsubscribe = Task.subscribe {
    // re-query and update your UI
  }

  // later, when you no longer need updates:
  unsubscribe()
  // #endregion example
}
