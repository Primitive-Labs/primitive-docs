import JsBaoClient

// Count lives on `.dynamic` in Swift. Returns an `Int`.
func count(tasks: TypedModel<Task>) {
  // #region example
  let remaining = tasks.dynamic.count(["completed": false])
  // #endregion example
  _ = remaining
}
