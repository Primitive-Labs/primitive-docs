import type { JsBaoClient } from "js-bao-wss-client";

// Lifecycle methods for a cron trigger. Every method here takes the triggerId
// (the ULID from create()), NOT the triggerKey — use list() to look the id up.
export async function cronLifecycle(client: JsBaoClient, triggerId: string) {
  // #region example
  await client.cronTriggers.list();                       // excludes archived
  await client.cronTriggers.get(triggerId);               // includes runtime.scheduledAlarmAt
  await client.cronTriggers.update(triggerId, {           // change cron/timezone/state etc.
    cron: "0 8 * * *",
    timezone: "America/New_York",
  });
  await client.cronTriggers.pause(triggerId);             // cancels the pending alarm
  await client.cronTriggers.resume(triggerId);            // clears lastError, reschedules
  await client.cronTriggers.test(triggerId);              // fire NOW; does not touch schedule
  await client.cronTriggers.delete(triggerId);            // soft delete (archive)
  // #endregion example
}
