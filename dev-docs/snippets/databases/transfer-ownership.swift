import JsBaoClient

// Transfer database ownership to another user.
func transferOwnership(client: JsBaoClient, databaseId: String, newOwnerId: String) async throws {
  // #region example
  let result = try await client.databases.transferOwnership(
    databaseId: databaseId,
    newOwnerId: newOwnerId
  )
  // #endregion example
  _ = result
}
