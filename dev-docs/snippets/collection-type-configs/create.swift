import JsBaoClient

// Create a new collection type configuration. Takes a typed
// `CreateCollectionTypeConfigParams`; `collectionType` is required, `ruleSetId`
// is optional.
func create(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let config = try await client.collectionTypeConfigs.create(
    params: CreateCollectionTypeConfigParams(
      collectionType: "class-students",
      ruleSetId: ruleSetId
    )
  )
  // #endregion example
  _ = config
}
