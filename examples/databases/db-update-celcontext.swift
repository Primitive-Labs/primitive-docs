import JsBaoClient

// The CEL context stores per-database values that operations and triggers
// reference via $database.celContext.* (or the legacy $database.metadata.*).
func updateCelContext(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  _ = try await client.databases.updateCelContext(
    databaseId: databaseId,
    celContext: ["teamId": "team-alpha", "projectId": "proj-1"]
  )
  // #endregion example
}
