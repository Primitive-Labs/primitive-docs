import Foundation
import JsBaoClient

// Create a record and save it. `tasks` is a TypedModel bound to a document.
func createTask(tasks: TypedModel<Task>) throws {
  // #region example
  let task = try tasks.create(Task(
    id: UUID().uuidString,
    title: "Review pull request",
    priority: 2
  ))
  _ = task
  // #endregion example
}
