import JsBaoClient

// Delete a record: load it, then call `delete(in:)` on the instance. Targets
// one open document and throws if that document isn't open.
func deleteX(taskId: String, documentId: String) throws {
  // #region example
  if let task = Task.find(taskId) {
    try task.delete(in: documentId)
  }
  // #endregion example
}
