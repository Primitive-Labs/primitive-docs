import JsBaoClient

// Update fields of an existing cron trigger. Schedule-relevant changes
// (cron, timezone, state) are pushed to the Durable Object.
func update(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let trigger = try await client.cronTriggers.update(
    triggerId: triggerId,
    params: UpdateCronTriggerParams(
      cron: "0 9 * * 1-5",
      timezone: "Europe/London",
      state: .active
    )
  )
  // #endregion example
  _ = trigger
}
