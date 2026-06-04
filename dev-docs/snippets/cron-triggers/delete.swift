import JsBaoClient

// Soft-delete (archive) a cron trigger and cancel its pending alarm.
func delete(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let result = try await client.cronTriggers.delete(triggerId: triggerId)
  let archived = result.archived
  // #endregion example
  _ = archived
}
