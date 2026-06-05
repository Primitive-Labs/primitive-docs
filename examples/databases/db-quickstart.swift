import JsBaoClient

// End-to-end runtime flow: create a database of a configured type, then call
// its registered operations. The server assigns ids and enforces each op's CEL.
func quickStart(client: JsBaoClient) async throws {
  // #region example
  // Create a database instance of the configured type
  let db = try await client.databases.create(params: CreateDatabaseParams(
    title: "Alpha Project", databaseType: "project"
  ))

  // Execute registered operations
  let result = try await client.databases.executeOperation(
    databaseId: db.databaseId, name: "listTasks",
    options: ExecuteOperationOptions(params: ["projectId": "proj-1"])
  )

  let createResult = try await client.databases.executeOperation(
    databaseId: db.databaseId, name: "createTask",
    options: ExecuteOperationOptions(params: ["title": "Ship v1", "projectId": "proj-1"])
  )
  // executeOperation returns a JSONValue; mutation result shape is { results: [{ id }] }.
  let taskId = createResult["results"]?.arrayValue?.first?["id"]?.stringValue // server-assigned ULID
  // #endregion example
  _ = (result, taskId)
}
