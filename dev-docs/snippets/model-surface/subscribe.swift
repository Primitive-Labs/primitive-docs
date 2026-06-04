import JsBaoClient

// Subscribe to model changes via the static `Task.subscribe`. Returns an
// unsubscribe closure — always call it when you're done.
func subscribe() {
  // #region example
  let unsubscribe = Task.subscribe {
    // re-query and update your UI
  }

  // later, when you no longer need updates:
  unsubscribe()
  // #endregion example
}
