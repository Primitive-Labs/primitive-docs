import JsBaoClient

// Remove a manager from a database.
func removeManager(client: JsBaoClient, databaseId: String, userId: String) async throws {
  // #region example
  let result = try await client.databases.removeManager(
    databaseId: databaseId,
    userId: userId
  )
  // #endregion example
  _ = result
}
