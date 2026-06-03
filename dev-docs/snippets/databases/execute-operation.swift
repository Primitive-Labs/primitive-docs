import JsBaoClient

// Execute a registered operation by name, with optional params and pagination.
func executeOperation(client: JsBaoClient, databaseId: String, name: String) async throws {
  // #region example
  let result = try await client.databases.executeOperation(
    databaseId: databaseId,
    name: name,
    options: [
      "params": ["status": "active"],
      "limit": 25,
    ]
  )
  // #endregion example
  _ = result
}
