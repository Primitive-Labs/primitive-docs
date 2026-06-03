import JsBaoClient

// Execute a batch of records using a named mutation operation.
// Each batch element is `["params": <record>]`.
func executeBatch(client: JsBaoClient, databaseId: String, operationName: String) async throws {
  // #region example
  let result = try await client.databases.executeBatch(
    databaseId: databaseId,
    operationName: operationName,
    batch: [
      ["params": ["id": "p1", "name": "Widget"]],
      ["params": ["id": "p2", "name": "Gadget"]],
    ]
  )
  // #endregion example
  _ = result
}
