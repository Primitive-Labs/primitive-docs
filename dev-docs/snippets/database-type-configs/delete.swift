import JsBaoClient

// Delete a database type configuration. Where JS resolves to a typed
// `{ success: boolean }`, Swift returns an untyped `[String: Any]` — read
// `success` out of the dict.
func delete(client: JsBaoClient, databaseType: String) async throws {
  // #region example
  let result = try await client.databaseTypeConfigs.delete(databaseType: databaseType)
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
