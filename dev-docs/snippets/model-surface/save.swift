import Foundation
import JsBaoClient

// Construct a record and persist it with the instance `save(in:)` — the
// unified create/update. It targets one open document and throws if that
// document isn't open. Returns the saved record.
func save(documentId: String) throws {
  // #region example
  let task = try Task(
    id: UUID().uuidString,
    title: "Review pull request",
    priority: 2
  ).save(in: documentId)
  _ = task
  // #endregion example
}
