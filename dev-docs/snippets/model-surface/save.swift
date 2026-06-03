import Foundation
import JsBaoClient

// Construct a record and persist it. `tasks` is a TypedModel bound to a
// document — Swift writes target the document the model is bound to.
func save(tasks: TypedModel<Task>) throws {
  // #region example
  let task = try tasks.create(Task(
    id: UUID().uuidString,
    title: "Review pull request",
    priority: 2
  ))
  _ = task
  // #endregion example
}
