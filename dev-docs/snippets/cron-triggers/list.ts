import type { JsBaoClient } from "js-bao-wss-client";

// List all cron triggers for the current app. Archived triggers are excluded.
export async function list(client: JsBaoClient) {
  // #region example
  const { items } = await client.cronTriggers.list();
  // #endregion example
  return items;
}
