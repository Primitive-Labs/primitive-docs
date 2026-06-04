import JsBaoClient

// Update a record: look it up, then apply the change.
func completeTask(tasks: TypedModel<Task>, taskId: String) {
  // #region example
  if let task = tasks.find(taskId) {
    tasks.update(task.id, ["completed": true])
  }
  // #endregion example
}
