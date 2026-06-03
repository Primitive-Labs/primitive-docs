import JsBaoClient

// Add a user as a manager of a database. Swift takes `userId` directly;
// JS wraps it in an `AddManagerParams` object (#962).
func addManager(client: JsBaoClient, databaseId: String, userId: String) async throws {
  // #region example
  let entry = try await client.databases.addManager(
    databaseId: databaseId,
    userId: userId
  )
  // #endregion example
  _ = entry
}
