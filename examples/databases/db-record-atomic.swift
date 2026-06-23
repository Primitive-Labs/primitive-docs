import JsBaoClient

// Atomic direct-record operations: numeric increment/decrement and StringSet
// add/remove. These mutate without a read-modify-write round trip.
func recordAtomicOps(client: JsBaoClient, databaseId: String) async throws {
  let db = client.databases.connect(databaseId: databaseId)
  // #region example
  // Increment/decrement numeric fields; returns the post-increment values.
  let newValues = try await db.increment(
    modelName: "tasks", id: "task-1",
    fields: ["priority": 1, "estimatedHours": -2]
  )

  // Atomically add/remove StringSet members.
  try await db.addToSet(modelName: "tasks", id: "task-1", sets: ["tags": ["featured"]])
  try await db.removeFromSet(modelName: "tasks", id: "task-1", sets: ["tags": ["sale"]])
  // #endregion example
  _ = newValues
}
