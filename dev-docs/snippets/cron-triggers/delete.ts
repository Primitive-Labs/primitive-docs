import type { JsBaoClient } from "js-bao-wss-client";

// Soft-delete (archive) a cron trigger and cancel its pending alarm.
export async function deleteX(client: JsBaoClient, triggerId: string) {
  // #region example
  const { archived } = await client.cronTriggers.delete(triggerId);
  // #endregion example
  return archived;
}
