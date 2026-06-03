import JsBaoClient

// Create a new collection type configuration. Swift takes an untyped
// `[String: Any]` params dictionary in place of `CreateCollectionTypeConfigParams`.
func create(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let config = try await client.collectionTypeConfigs.create(params: [
    "collectionType": "class-students",
    "ruleSetId": ruleSetId,
  ])
  // #endregion example
  _ = config
}
