import JsBaoClient

// Index management on a DoDb handle. Add indexes to every field you filter or
// sort on; without one the engine scans all records of that model.
func manageIndexes(client: JsBaoClient, databaseId: String) async throws {
  let db = client.databases.connect(databaseId: databaseId)
  // #region example
  // Sync the desired index state for one or more models (additive — the
  // server registers only what's missing).
  _ = try await db.syncIndexes(models: [
    DoDbModelSyncState(
      modelName: "tasks",
      indexes: [
        DoDbModelSyncState.Index(fieldName: "category"),
        DoDbModelSyncState.Index(fieldName: "priority", fieldType: "number"),
      ]
    )
  ])

  // Or register indexes manually.
  try await db.registerIndex(modelName: "tasks", fieldName: "category", fieldType: "string")
  try await db.registerIndex(modelName: "tasks", fieldName: "priority", fieldType: "number")
  try await db.registerIndex(modelName: "appUsers", fieldName: "email", fieldType: "string", unique: true)

  // Composite unique constraint across multiple fields.
  try await db.registerUniqueConstraint(modelName: "categories", constraintName: "name_parentId", fields: ["name", "parentId"])

  // List and drop.
  let indexes = try await db.listIndexes(modelName: "tasks")
  try await db.dropIndex(modelName: "tasks", fieldName: "category")

  let constraints = try await db.listUniqueConstraints(modelName: "categories")
  try await db.dropUniqueConstraint(modelName: "categories", constraintName: "name_parentId")
  // #endregion example
  _ = (indexes, constraints)
}
