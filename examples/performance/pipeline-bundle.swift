import JsBaoClient

// Run a single pipeline operation that bundles several reads from the SAME
// database into one round trip. The pipeline is defined server-side (TOML);
// the client just executes it and reads each step's `data` off `steps`.
func loadBundle(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let bundle = try await client.databases.executeOperation(databaseId: databaseId, name: "dashboardBundle")
  let steps = (bundle as? [String: Any])?["steps"] as? [String: Any]
  let groups = (steps?["groups"] as? [String: Any])?["data"] as? [[String: Any]] ?? []
  let accounts = (steps?["accounts"] as? [String: Any])?["data"] as? [[String: Any]] ?? []
  let holdings = (steps?["holdings"] as? [String: Any])?["data"] as? [[String: Any]] ?? []
  // #endregion example
  _ = (groups, accounts, holdings)
}
