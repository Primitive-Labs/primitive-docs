import JsBaoClient

// Connect to a database and use the `DoDb` handle for ad-hoc record ops
// (save / find / query / count / aggregate + index management) — parity with
// the JS `databases.connect()` direct-record surface.
func useDoDb(client: JsBaoClient) async throws {
  // #region example
  let db = client.databases.connect(databaseId: "tasks")
  let id = try await db.save(modelName: "Task", data: [
    "title": "Review PR",
    "priority": 2,
  ])
  let row = try await db.find(modelName: "Task", id: id)
  // #endregion example
  _ = row
}
