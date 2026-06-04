import JsBaoClient

// Execute a batch of records using a named mutation operation.
// Each batch element wraps one record's params.
func executeBatch(client: JsBaoClient, databaseId: String, operationName: String) async throws {
  // #region example
  let result = try await client.databases.executeBatch(
    databaseId: databaseId,
    operationName: operationName,
    batch: [
      DatabaseBatchOperation(params: ["id": "p1", "name": "Widget"]),
      DatabaseBatchOperation(params: ["id": "p2", "name": "Gadget"]),
    ]
  )
  // #endregion example
  _ = result
}
