import JsBaoClient

// Update fields of an existing cron trigger. Swift takes an untyped params
// dict (JS uses a typed `UpdateCronTriggerParams`) and returns `[String: Any]`.
func update(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let trigger = try await client.cronTriggers.update(
    triggerId: triggerId,
    params: [
      "cron": "0 9 * * 1-5",
      "timezone": "Europe/London",
      "state": "active",
    ]
  )
  // #endregion example
  _ = trigger
}
