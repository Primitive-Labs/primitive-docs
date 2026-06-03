import JsBaoClient

// Fetch the configuration for one collection type. Swift returns an untyped
// `[String: Any]` instead of the typed `CollectionTypeConfigInfo`.
func get(client: JsBaoClient, collectionType: String) async throws {
  // #region example
  let config = try await client.collectionTypeConfigs.get(collectionType: collectionType)
  let ruleSetId = config["ruleSetId"] as? String
  // #endregion example
  _ = (config, ruleSetId)
}
