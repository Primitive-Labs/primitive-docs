import JsBaoClient

// Delete a group type configuration. Where JS resolves to a typed
// `{ success: boolean }`, Swift returns an untyped `[String: Any]` — read
// `success` out of the dict. The Swift client also does NOT percent-encode the
// `groupType` path segment (#590).
func delete(client: JsBaoClient, groupType: String) async throws {
  // #region example
  let result = try await client.groupTypeConfigs.delete(groupType: groupType)
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
