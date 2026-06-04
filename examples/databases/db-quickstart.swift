import JsBaoClient

// End-to-end runtime flow: create a database of a configured type, then call
// its registered operations. The server assigns ids and enforces each op's CEL.
func quickStart(client: JsBaoClient) async throws {
  // #region example
  // Create a database instance of the configured type
  let db = try await client.databases.create(params: [
    "title": "Alpha Project", "databaseType": "project",
  ])
  let databaseId = db["databaseId"] as? String ?? ""

  // Execute registered operations
  let result = try await client.databases.executeOperation(
    databaseId: databaseId, name: "listTasks",
    options: ["params": ["projectId": "proj-1"]]
  )

  let createResult = try await client.databases.executeOperation(
    databaseId: databaseId, name: "createTask",
    options: ["params": ["title": "Ship v1", "projectId": "proj-1"]]
  )
  // executeOperation returns Any; mutation result shape is { results: [{ id }] }.
  let results = (createResult as? [String: Any])?["results"] as? [[String: Any]]
  let taskId = results?.first?["id"] as? String // server-assigned ULID
  // #endregion example
  _ = (result, taskId)
}
