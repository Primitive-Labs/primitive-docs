import JsBaoClient

// Get a cron trigger by id. Swift returns an untyped `[String: Any]`; pull
// fields out by key (JS returns a typed `CronTriggerInfo`).
func get(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let trigger = try await client.cronTriggers.get(triggerId: triggerId)
  let state = trigger["state"] as? String
  // #endregion example
  _ = state
}
