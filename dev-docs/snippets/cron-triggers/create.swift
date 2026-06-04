import JsBaoClient

// Create a new cron trigger. The associated Durable Object is bound and
// scheduled as part of this call.
func create(client: JsBaoClient) async throws {
  // #region example
  let trigger = try await client.cronTriggers.create(params: CreateCronTriggerParams(
    triggerKey: "nightly-digest",
    displayName: "Nightly Digest",
    cron: "0 6 * * *",
    workflowKey: "send-digest",
    timezone: "America/New_York",
    overlapPolicy: .skip,
    rootInput: ["audience": "all"]
  ))
  // #endregion example
  _ = trigger
}
