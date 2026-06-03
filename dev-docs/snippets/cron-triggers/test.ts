import type { JsBaoClient } from "js-bao-wss-client";

// Fire the associated workflow immediately without affecting the schedule.
export async function test(client: JsBaoClient, triggerId: string) {
  // #region example
  const { started, runId } = await client.cronTriggers.test(triggerId);
  // #endregion example
  return { started, runId };
}
