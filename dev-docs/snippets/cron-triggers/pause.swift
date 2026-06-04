import JsBaoClient

// Pause a trigger. The scheduled alarm is cancelled and no further runs are
// started until the trigger is resumed.
func pause(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let trigger = try await client.cronTriggers.pause(triggerId: triggerId)
  let state = trigger.state
  // #endregion example
  _ = state
}
