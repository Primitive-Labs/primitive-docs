import JsBaoClient

// Run a single pipeline operation that bundles several reads from the SAME
// database into one round trip. The pipeline is defined server-side (TOML);
// the client just executes it and reads each step's `data` off `steps`.
func loadBundle(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  // executeOperation returns a JSONValue — use its object/array accessors and
  // string-keyed subscript to read each step's `data` off `steps`.
  let bundle = try await client.databases.executeOperation(databaseId: databaseId, name: "dashboardBundle")
  let groups = bundle["steps"]?["groups"]?["data"]?.arrayValue ?? []
  let accounts = bundle["steps"]?["accounts"]?["data"]?.arrayValue ?? []
  let holdings = bundle["steps"]?["holdings"]?["data"]?.arrayValue ?? []
  // #endregion example
  _ = (groups, accounts, holdings)
}
