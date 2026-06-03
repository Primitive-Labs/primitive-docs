import JsBaoClient

// Run a registered database operation. All end-user data access goes through
// operations (the operation's CEL `access` is the authorization point).
func runOperation(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let result = try await client.databases.executeOperation(
    databaseId: databaseId,
    name: "list-products",
    options: ["params": ["search": "widget"]]
  )
  // result: { data: [...records], hasMore, nextCursor? }
  // #endregion example
  _ = result
}
