import type { JsBaoClient } from "js-bao-wss-client";

// Get a cron trigger by id, including runtime state from the Durable Object.
export async function get(client: JsBaoClient, triggerId: string) {
  // #region example
  const trigger = await client.cronTriggers.get(triggerId);
  // #endregion example
  return trigger;
}
