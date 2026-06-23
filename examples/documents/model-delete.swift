import JsBaoClient

// Delete a record: load it, then delete.
func deleteTask(documentId: String, taskId: String) async throws {
  // #region example
  if let task = try await Task.find(taskId) {
    try task.delete(in: documentId)
  }
  // #endregion example
}
