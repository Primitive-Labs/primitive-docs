import type { JsBaoClient } from "js-bao-wss-client";

// Pause a trigger. The scheduled alarm is cancelled and no further runs are
// started until the trigger is resumed.
export async function pause(client: JsBaoClient, triggerId: string) {
  // #region example
  const trigger = await client.cronTriggers.pause(triggerId);
  // #endregion example
  return trigger;
}
