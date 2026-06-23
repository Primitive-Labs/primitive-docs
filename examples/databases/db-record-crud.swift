import JsBaoClient

// Direct record access (owner/manager only): connect() returns a DoDb handle.
// The Swift handle addresses models by string name (there is no model-class
// registry). For most apps, prefer registered operations over this path.
func recordCrud(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let db = client.databases.connect(databaseId: databaseId)

  // Save (upsert) — data must carry an "id" (or use upsertOn).
  _ = try await db.save(modelName: "tasks", data: ["id": "task-1", "title": "Ship v1"])

  // Insert only — fails if the record already exists.
  _ = try await db.save(
    modelName: "tasks", data: ["id": "task-3", "title": "Draft"],
    options: DoDbSaveOptions(ifNotExists: true)
  )

  // Conditional write — only proceeds if the existing record matches.
  _ = try await db.save(
    modelName: "tasks", data: ["id": "task-3", "title": "Draft"],
    options: DoDbSaveOptions(condition: ["completed": false])
  )

  // Seed StringSet fields on the write.
  _ = try await db.save(
    modelName: "tasks", data: ["id": "task-4", "title": "Tagged"],
    options: DoDbSaveOptions(stringSets: ["tags": ["featured", "sale"]])
  )

  // Patch (partial update) — only the provided fields change.
  _ = try await db.patch(modelName: "tasks", id: "task-1", data: ["priority": 5])
  _ = try await db.patch(
    modelName: "tasks", id: "task-1", data: ["priority": 7],
    options: DoDbPatchOptions(condition: ["completed": false])
  )

  // Find a single record by id (or nil).
  let task = try await db.find(modelName: "tasks", id: "task-1")

  // Delete — true if a record existed.
  let deleted = try await db.delete(modelName: "tasks", id: "task-2")

  // Count, optionally filtered.
  let total = try await db.count(modelName: "tasks")
  let open = try await db.count(modelName: "tasks", filter: ["completed": false])
  // #endregion example
  _ = (task, deleted, total, open)
}
