import JsBaoClient

// Update a record: load it, mutate fields, save.
func completeTask(documentId: String, taskId: String) async throws {
  // #region example
  if var task = try await Task.find(taskId) {
    task.completed = true
    try task.save(in: documentId)
  }
  // #endregion example
}
