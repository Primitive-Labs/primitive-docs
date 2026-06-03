import JsBaoClient

// Delete a database type configuration. Resolves to a typed `SuccessResult`
// (`{ success }`).
func delete(client: JsBaoClient, databaseType: String) async throws {
  // #region example
  let result = try await client.databaseTypeConfigs.delete(databaseType: databaseType)
  let success = result.success
  // #endregion example
  _ = success
}
