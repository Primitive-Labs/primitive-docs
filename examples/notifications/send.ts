// no-parity — notifications is a JS-client-only capability (no Swift API yet).
import type { JsBaoClient } from "js-bao-wss-client";

// Send an in-app notification to a user; add push channels once they've
// registered a device (see notifications/register-device).
export async function sendNotification(client: JsBaoClient, userId: string) {
  // #region example
  const { results } = await client.notifications.send({
    title: "Your report is ready",
    body: "Tap to view this week's summary.",
    target: { userId },
    channels: ["in-app", "ios"],
    deepLink: "myapp://reports/latest",
    idempotencyKey: `weekly-report-${userId}-2026-07-14`,
  });

  for (const result of results) {
    console.log(result.channel, result.status); // "in-app" "delivered", "ios" "delivered"
  }
  // #endregion example
  return results;
}
