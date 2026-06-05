import JsBaoClient

// Inspect and manually fire cron triggers from the client.
func manageCronTriggers(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let list = try await client.cronTriggers.list()
  let items = list.items
  let trigger = try await client.cronTriggers.get(triggerId: triggerId)
  _ = try await client.cronTriggers.test(triggerId: triggerId) // fire once, now
  // #endregion example
  _ = (items, trigger)
}
