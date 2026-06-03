import type { JsBaoClient } from "js-bao-wss-client";

// Update one or more fields of an existing cron trigger. Schedule-relevant
// changes (cron, timezone, state) are pushed to the Durable Object.
export async function update(client: JsBaoClient, triggerId: string) {
  // #region example
  const trigger = await client.cronTriggers.update(triggerId, {
    cron: "0 9 * * 1-5",
    timezone: "Europe/London",
    state: "active",
  });
  // #endregion example
  return trigger;
}
