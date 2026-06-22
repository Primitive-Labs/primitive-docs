import JsBaoClient

// Databases are schemaless. List the models (collections) a database has seen
// via the raw records endpoint. Returns { models: ["contacts", "orders", ...] }.
func listModels(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let result = try await client.makeRequest(
    "GET",
    "/databases/\(databaseId)/records/models"
  )
  let models = (result as? [String: Any])?["models"] as? [String]
  // models: ["contacts", "orders", "products"]
  // #endregion example
  _ = models
}
