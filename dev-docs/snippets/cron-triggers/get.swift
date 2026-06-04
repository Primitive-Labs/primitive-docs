import JsBaoClient

// Get a cron trigger by id, including runtime state from the Durable Object.
func get(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let trigger = try await client.cronTriggers.get(triggerId: triggerId)
  let state = trigger.state
  // #endregion example
  _ = state
}
