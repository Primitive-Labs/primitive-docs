import JsBaoClient

// Read a database's CEL context dict (referenced from access rules as
// `database.celContext.<key>`).
func getCelContext(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let payload = try await client.databases.getCelContext(databaseId: databaseId)
  let celContext = payload.celContext
  // #endregion example
  _ = celContext
}
