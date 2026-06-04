import JsBaoClient

// Update a record: load it, mutate fields on the value, then `save(in:)` it
// back. `save(in:)` is the unified create/update — it writes in place when the
// record already exists. Targets one open document; throws if it isn't open.
func update(taskId: String, documentId: String) throws {
  // #region example
  if var task = Task.find(taskId) {
    task.completed = true
    try task.save(in: documentId)
  }
  // #endregion example
}
