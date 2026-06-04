import JsBaoClient

// Add a user as a manager of a database.
func addManager(client: JsBaoClient, databaseId: String, userId: String) async throws {
  // #region example
  let entry = try await client.databases.addManager(
    databaseId: databaseId,
    params: AddManagerParams(userId: userId)
  )
  // #endregion example
  _ = entry
}
