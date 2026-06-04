import JsBaoClient

// Create a new named operation (query or mutation) on a database.
func createOperation(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let op = try await client.databases.createOperation(
    databaseId: databaseId,
    params: CreateOperationParams(
      name: "activeProducts",
      type: .query,
      modelName: "Product",
      access: "authenticated",
      definition: ["filter": ["status": "active"]]
    )
  )
  // #endregion example
  _ = op
}
