import JsBaoClient

// Create a new database type configuration. Swift takes an untyped
// `[String: Any]` params dictionary in place of `CreateDatabaseTypeConfigParams`.
func create(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let config = try await client.databaseTypeConfigs.create(params: [
    "databaseType": "userDB",
    "ruleSetId": ruleSetId,
    "triggers": [
      "Task": ["triggers": [["on": "create", "set": ["status": "open"]]]],
    ],
    "metadataAccess": "user.role == 'admin'",
  ])
  // #endregion example
  _ = config
}
