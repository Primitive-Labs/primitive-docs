import Foundation
import JsBaoClient

// Create a record and save it to a document. `save(in:)` writes the new record
// into the named open document.
func createTask(documentId: String) throws {
  // #region example
  let task = try Task(
    id: UUID().uuidString,
    title: "Review pull request",
    priority: 2,
    dueDate: ISO8601DateFormatter().string(from: Date())
  ).save(in: documentId)
  _ = task
  // #endregion example
}
