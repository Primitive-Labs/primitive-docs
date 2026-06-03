import type { JsBaoClient } from "js-bao-wss-client";

// Create a new cron trigger. The associated Durable Object is bound and
// scheduled as part of this call.
export async function create(client: JsBaoClient) {
  // #region example
  const trigger = await client.cronTriggers.create({
    triggerKey: "nightly-digest",
    displayName: "Nightly Digest",
    cron: "0 6 * * *",
    workflowKey: "send-digest",
    timezone: "America/New_York",
    overlapPolicy: "skip",
    rootInput: { audience: "all" },
  });
  // #endregion example
  return trigger;
}
