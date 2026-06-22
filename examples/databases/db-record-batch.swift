import JsBaoClient

// db.batch executes multiple writes atomically at the storage layer. It returns
// one result per input op; a per-item failure does NOT throw, so check .success.
func recordBatch(client: JsBaoClient, databaseId: String) async throws {
  let db = client.databases.connect(databaseId: databaseId)
  // #region example
  let results = try await db.batch([
    DoDbBatchOperation(op: .save, modelName: "tasks", id: "t-1", data: ["title": "A"]),
    DoDbBatchOperation(op: .patch, modelName: "tasks", id: "t-2", data: ["completed": true]),
    DoDbBatchOperation(op: .delete, modelName: "tasks", id: "t-3"),
    DoDbBatchOperation(op: .increment, modelName: "tasks", id: "t-4", fields: ["priority": 1]),
    DoDbBatchOperation(op: .addToSet, modelName: "tasks", id: "t-5", stringSets: ["tags": ["urgent"]]),
  ])

  for r in results where !r.success {
    print("op failed:", r.id, r.error ?? "")
  }
  // #endregion example
  _ = results
}
