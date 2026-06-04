import JsBaoClient

// Databases are schemaless — the system tracks fields and inferred types as
// records are written. describe() returns a model's observed field schema.
func describeModel(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let fields = try await client.databases.describe(databaseId: databaseId, modelName: "products")
  // [["model_name": "products", "field_name": "name", "inferred_type": "string", ...]]
  // #endregion example
  _ = fields
}
