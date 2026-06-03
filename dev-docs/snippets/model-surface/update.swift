import JsBaoClient

// Update a record: look it up, then apply a partial `[String: Any]` change.
// Unknown keys are dropped; write failures are logged, not thrown.
func update(tasks: TypedModel<Task>, taskId: String) {
  // #region example
  if let task = tasks.find(taskId) {
    tasks.update(task.id, ["completed": true])
  }
  // #endregion example
}
