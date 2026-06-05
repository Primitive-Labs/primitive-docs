import JsBaoClient

// Update a record: load it, mutate fields, save.
func completeTask(documentId: String, taskId: String) throws {
  // #region example
  if var task = Task.find(taskId) {
    task.completed = true
    try task.save(in: documentId)
  }
  // #endregion example
}
