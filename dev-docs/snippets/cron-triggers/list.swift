import JsBaoClient

// List all cron triggers. Swift returns an untyped `[String: Any]` envelope;
// the trigger rows live under the `"items"` key.
func list(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.cronTriggers.list()
  let items = result["items"] as? [[String: Any]] ?? []
  // #endregion example
  _ = items
}
