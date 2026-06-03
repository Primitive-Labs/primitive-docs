import JsBaoClient

// Merge new key-value pairs into a database's CEL context dict.
func updateCelContext(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let db = try await client.databases.updateCelContext(
    databaseId: databaseId,
    celContext: ["region": "eu-west", "tier": "premium"]
  )
  // #endregion example
  _ = db
}
