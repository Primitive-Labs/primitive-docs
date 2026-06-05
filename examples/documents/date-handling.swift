import Foundation
import JsBaoClient

// Dates are stored as ISO-8601 strings — lexicographic order matches
// chronological order, so string comparison works in queries.
func dateHandling(documentId: String, taskId: String) throws {
  // #region example
  let now = ISO8601DateFormatter().string(from: Date())

  // Store
  if var task = Task.find(taskId) {
    task.dueDate = now
    try task.save(in: documentId)

    // Compare
    if let dueDate = task.dueDate, dueDate < now {
      // overdue
    }
  }

  // Query with date comparison
  let overdue = Task.query(["dueDate": ["$lt": now]])
  // #endregion example
  _ = overdue
}
