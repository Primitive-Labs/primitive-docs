import JsBaoClient

// Create a new database type configuration. `databaseType` is required;
// `ruleSetId`, `triggers`, and `metadataAccess` are optional.
func create(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let config = try await client.databaseTypeConfigs.create(
    params: CreateDatabaseTypeConfigParams(
      databaseType: "userDB",
      ruleSetId: ruleSetId,
      triggers: [
        "Task": ["triggers": [["on": "create", "set": ["status": "open"]]]],
      ],
      metadataAccess: "user.role == 'admin'"
    )
  )
  // #endregion example
  _ = config
}
