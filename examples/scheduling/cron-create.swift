import JsBaoClient

// Create a cron trigger that fires a workflow on a schedule. The field names
// are triggerKey / cron / rootInput (NOT key / schedule / input), and the
// returned triggerId (a ULID) is what every subsequent call takes.
func createCronTrigger(client: JsBaoClient) async throws {
  // #region example
  let trigger = try await client.cronTriggers.create(params: CreateCronTriggerParams(
    triggerKey: "nightly-digest",
    displayName: "Nightly digest email",
    cron: "0 9 * * *",                    // NOT `schedule`
    workflowKey: "send-digest",
    timezone: "America/Los_Angeles",      // set whenever the hour is user-visible
    overlapPolicy: .skip,                 // .skip (default) | .allow — no "queue"
    rootInput: ["digestType": "daily"],   // NOT `input`
    inputMapping: ["firedAt": "{{now}}"]  // merged over rootInput; {{now}} = fire time
  ))
  // trigger.triggerId is a ULID — use it for get/update/pause/test/delete.
  // #endregion example
  _ = trigger
}
