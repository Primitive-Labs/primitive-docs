import JsBaoClient

// Update a group type configuration with the typed
// `UpdateGroupTypeConfigParams`. `ruleSetId` is tri-state: `.value(...)` to
// set, `.clear` to remove the current rule set (where JS passes `null`), or
// omit to leave unchanged. The `groupType` path segment is percent-encoded.
func update(
  client: JsBaoClient,
  groupType: String,
  ruleSetId: String
) async throws {
  // #region example
  let config = try await client.groupTypeConfigs.update(
    groupType: groupType,
    params: UpdateGroupTypeConfigParams(
      ruleSetId: .value(ruleSetId),
      autoAddCreator: false
    )
  )
  // #endregion example
  _ = config
}
