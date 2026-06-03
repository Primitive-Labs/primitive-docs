import JsBaoClient

// Update a collection type configuration's rule set. To remove the current rule
// set, pass `NSNull()` in the params dict (the untyped equivalent of JS `null`).
func update(
  client: JsBaoClient,
  collectionType: String,
  ruleSetId: String
) async throws {
  // #region example
  let config = try await client.collectionTypeConfigs.update(
    collectionType: collectionType,
    params: ["ruleSetId": ruleSetId]
  )
  // #endregion example
  _ = config
}
