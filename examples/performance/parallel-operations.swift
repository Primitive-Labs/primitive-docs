import JsBaoClient

// Parallelize independent operations: one round trip's worth of wall-clock
// latency instead of N sequential ones. Only use this when no call depends on
// another call's result.
func loadDashboard(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  async let groups = client.databases.executeOperation(databaseId: databaseId, name: "listGroups")
  async let accounts = client.databases.executeOperation(databaseId: databaseId, name: "listAccounts")
  async let holdings = client.databases.executeOperation(databaseId: databaseId, name: "listHoldings")

  let (g, a, h) = try await (groups, accounts, holdings)
  // #endregion example
  _ = (g, a, h)
}
