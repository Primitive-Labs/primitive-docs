import JsBaoClient

// List all cron triggers for the current app. Archived triggers are excluded.
func list(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.cronTriggers.list()
  let items = result.items
  // #endregion example
  _ = items
}
