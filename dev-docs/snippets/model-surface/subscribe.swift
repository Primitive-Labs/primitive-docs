import JsBaoClient

// Subscribe to model changes via `.dynamic`. Returns an unsubscribe closure —
// always call it when you're done.
func subscribe(tasks: TypedModel<Task>) {
  // #region example
  let unsubscribe = tasks.dynamic.subscribe {
    // re-query and update your UI
  }

  // later, when you no longer need updates:
  unsubscribe()
  // #endregion example
}
