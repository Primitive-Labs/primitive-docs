import Foundation
import JsBaoClient

// Construct a record from a codegen-generated model and persist it. The
// generated `Task` is a `struct` conforming to `PrimitiveModel`; CRUD is the
// static `Task.*` facade for reads plus the instance `save(in:)` /
// `delete(in:)` for writes — no per-document wrapper. `save(in:)` targets one
// open document and throws if it isn't open.
func useGeneratedModel(documentId: String) throws {
  // #region example
  let task = try Task(
    id: UUID().uuidString,
    title: "Review pull request",
    priority: 2
  ).save(in: documentId)
  _ = task
  // #endregion example
}
