import JsBaoClient

// Delete a record: load it, then delete.
func deleteTask(documentId: String, taskId: String) throws {
  // #region example
  if let task = Task.find(taskId) {
    try task.delete(in: documentId)
  }
  // #endregion example
}
