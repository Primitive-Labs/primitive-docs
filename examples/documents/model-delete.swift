import JsBaoClient

// Delete a record by id.
func deleteTask(tasks: TypedModel<Task>, taskId: String) {
  // #region example
  tasks.delete(taskId)
  // #endregion example
}
