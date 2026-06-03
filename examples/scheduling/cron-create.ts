import type { JsBaoClient } from "js-bao-wss-client";

// Create a cron trigger that fires a workflow on a schedule. The field names
// are triggerKey / cron / rootInput (NOT key / schedule / input), and the
// returned triggerId (a ULID) is what every subsequent call takes.
export async function createCronTrigger(client: JsBaoClient) {
  // #region example
  const trigger = await client.cronTriggers.create({
    triggerKey: "nightly-digest",
    displayName: "Nightly digest email",
    cron: "0 9 * * *",                  // NOT `schedule`
    timezone: "America/Los_Angeles",    // set whenever the hour is user-visible
    workflowKey: "send-digest",
    overlapPolicy: "skip",              // "skip" (default) | "allow" — no "queue"
    rootInput: { digestType: "daily" }, // NOT `input`
    inputMapping: { firedAt: "{{now}}" }, // merged over rootInput; {{now}} = fire time
  });
  // trigger.triggerId is a ULID — use it for get/update/pause/test/delete.
  // #endregion example
  return trigger;
}
