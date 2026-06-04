import JsBaoClient

// Lifecycle methods for a cron trigger. Every method here takes the triggerId
// (the ULID from create()), NOT the triggerKey — use list() to look the id up.
func cronLifecycle(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  _ = try await client.cronTriggers.list()                         // excludes archived
  _ = try await client.cronTriggers.get(triggerId: triggerId)      // includes runtime.scheduledAlarmAt
  _ = try await client.cronTriggers.update(                        // change cron/timezone/state etc.
    triggerId: triggerId,
    params: ["cron": "0 8 * * *", "timezone": "America/New_York"]
  )
  _ = try await client.cronTriggers.pause(triggerId: triggerId)    // cancels the pending alarm
  _ = try await client.cronTriggers.resume(triggerId: triggerId)   // clears lastError, reschedules
  _ = try await client.cronTriggers.test(triggerId: triggerId)     // fire NOW; does not touch schedule
  _ = try await client.cronTriggers.delete(triggerId: triggerId)   // soft delete (archive)
  // #endregion example
}
