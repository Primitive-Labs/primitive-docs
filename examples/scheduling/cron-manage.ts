import type { JsBaoClient } from "js-bao-wss-client";

// Inspect and manually fire cron triggers from the client.
export async function manageCronTriggers(client: JsBaoClient, triggerId: string) {
  // #region example
  const { items } = await client.cronTriggers.list();
  const trigger = await client.cronTriggers.get(triggerId);
  await client.cronTriggers.test(triggerId); // fire once, now
  // #endregion example
  return { items, trigger };
}
