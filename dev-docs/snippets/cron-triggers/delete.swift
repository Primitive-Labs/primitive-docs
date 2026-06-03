import JsBaoClient

// Soft-delete (archive) a cron trigger and cancel its pending alarm. Swift
// returns an untyped `[String: Any]`; JS returns a typed `{ archived }`.
func delete(client: JsBaoClient, triggerId: String) async throws {
  // #region example
  let result = try await client.cronTriggers.delete(triggerId: triggerId)
  let archived = result["archived"] as? Bool ?? false
  // #endregion example
  _ = archived
}
