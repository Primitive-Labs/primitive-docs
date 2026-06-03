import JsBaoClient

// Delete a group type configuration. Returns the typed `SuccessResult`
// (`{ success }`). The `groupType` path segment is percent-encoded (#590).
func delete(client: JsBaoClient, groupType: String) async throws {
  // #region example
  let result = try await client.groupTypeConfigs.delete(groupType: groupType)
  let success = result.success
  // #endregion example
  _ = success
}
