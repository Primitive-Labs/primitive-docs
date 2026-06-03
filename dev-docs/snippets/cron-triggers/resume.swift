import JsBaoClient

// Resume a paused or error_paused trigger. Swift returns an untyped
// `[String: Any]` (JS returns a typed `CronTriggerInfo`).
func resume(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let trigger = try await client.cronTriggers.resume(triggerId: triggerId)
  let nextFireAt = trigger["nextFireAt"] as? String
  // #endregion example
  _ = nextFireAt
}
