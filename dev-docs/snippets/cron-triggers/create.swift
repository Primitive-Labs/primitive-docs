import JsBaoClient

// Create a new cron trigger. Swift takes an untyped params dict (JS uses a
// typed `CreateCronTriggerParams`) and returns an untyped `[String: Any]`.
func create(client: JsBaoClient) async throws {
  // #region example
  let trigger = try await client.cronTriggers.create(params: [
    "triggerKey": "nightly-digest",
    "displayName": "Nightly Digest",
    "cron": "0 6 * * *",
    "workflowKey": "send-digest",
    "timezone": "America/New_York",
    "overlapPolicy": "skip",
    "rootInput": ["audience": "all"],
  ])
  // #endregion example
  _ = trigger
}
