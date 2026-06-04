import JsBaoClient

// Resume a paused or error_paused trigger. Clears lastError and reschedules
// the next fire.
func resume(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let trigger = try await client.cronTriggers.resume(triggerId: triggerId)
  let nextFireAt = trigger.nextFireAt
  // #endregion example
  _ = nextFireAt
}
