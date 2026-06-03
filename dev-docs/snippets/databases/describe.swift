import JsBaoClient

// Get the field schema for a model in a database.
func describe(client: JsBaoClient, databaseId: String, modelName: String) async throws {
  // #region example
  let fields = try await client.databases.describe(
    databaseId: databaseId,
    modelName: modelName
  )
  // #endregion example
  _ = fields
}
