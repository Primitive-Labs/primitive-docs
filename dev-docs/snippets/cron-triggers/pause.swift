import JsBaoClient

// Pause a trigger. Swift returns an untyped `[String: Any]` (JS returns a
// typed `CronTriggerInfo`).
func pause(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let trigger = try await client.cronTriggers.pause(triggerId: triggerId)
  let state = trigger["state"] as? String
  // #endregion example
  _ = state
}
