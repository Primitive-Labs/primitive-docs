import JsBaoClient

// Fetch the configuration for one collection type. Returns a typed
// `CollectionTypeConfigInfo`; `ruleSetId` is an optional `String`.
func get(client: JsBaoClient, collectionType: String) async throws {
  // #region example
  let config = try await client.collectionTypeConfigs.get(collectionType: collectionType)
  let ruleSetId = config.ruleSetId
  // #endregion example
  _ = (config, ruleSetId)
}
