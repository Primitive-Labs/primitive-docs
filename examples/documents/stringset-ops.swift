import JsBaoClient

// Stringset fields are a native Set<String>: mutate the set, test
// membership, then save the record to persist the change.
func stringsetOps(documentId: String, taskId: String) async throws {
  // #region example
  if var task = try await Task.find(taskId) {
    // Add/remove tags
    task.tags?.insert("urgent")
    task.tags?.remove("low-priority")

    // Check membership
    if task.tags?.contains("urgent") == true {
      // ...
    }

    try task.save(in: documentId)
  }
  // #endregion example
}
