import Foundation
import JsBaoClient

// Construct a record from a codegen-generated model. The generated `Task` is a
// `struct` conforming to `PrimitiveModel`; CRUD goes through a `TypedModel<Task>`
// wrapper bound to a document rather than methods on the struct itself.
func useGeneratedModel(tasks: TypedModel<Task>) throws {
  // #region example
  let task = try tasks.create(Task(
    id: UUID().uuidString,
    title: "Review pull request",
    priority: 2
  ))
  _ = task
  // #endregion example
}
