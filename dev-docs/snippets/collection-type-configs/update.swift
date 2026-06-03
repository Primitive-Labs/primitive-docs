import JsBaoClient

// Update a collection type configuration's rule set. `ruleSetId` is a tri-state
// `Updatable<String>?`: `.value(id)` to set, `.clear` to remove the current rule
// set (the equivalent of JS `null`), or omit to leave it unchanged.
func update(
  client: JsBaoClient,
  collectionType: String,
  ruleSetId: String
) async throws {
  // #region example
  let config = try await client.collectionTypeConfigs.update(
    collectionType: collectionType,
    params: UpdateCollectionTypeConfigParams(ruleSetId: .value(ruleSetId))
  )
  // #endregion example
  _ = config
}
