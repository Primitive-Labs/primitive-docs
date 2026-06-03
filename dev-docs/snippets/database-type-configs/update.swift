import JsBaoClient

// Update an existing database type configuration. To clear a field, pass
// `.clear` (the typed equivalent of JS `null`); omit a field to leave it
// unchanged.
func update(
  client: JsBaoClient,
  databaseType: String,
  ruleSetId: String
) async throws {
  // #region example
  let config = try await client.databaseTypeConfigs.update(
    databaseType: databaseType,
    params: UpdateDatabaseTypeConfigParams(
      ruleSetId: .value(ruleSetId),
      triggers: .clear,
      metadataAccess: .value("user.role == 'admin'")
    )
  )
  // #endregion example
  _ = config
}
