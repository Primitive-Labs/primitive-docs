import type { JsBaoClient } from "js-bao-wss-client";

// Resume a paused or error_paused trigger. Clears lastError and reschedules
// the next fire.
export async function resume(client: JsBaoClient, triggerId: string) {
  // #region example
  const trigger = await client.cronTriggers.resume(triggerId);
  // #endregion example
  return trigger;
}
