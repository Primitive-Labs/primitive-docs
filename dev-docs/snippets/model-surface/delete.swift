import JsBaoClient

// Delete a record by id.
func deleteX(tasks: TypedModel<Task>, taskId: String) {
  // #region example
  tasks.delete(taskId)
  // #endregion example
}
