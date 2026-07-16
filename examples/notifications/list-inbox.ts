// no-parity — notifications is a JS-client-only capability (no Swift API yet).
import type { JsBaoClient } from "js-bao-wss-client";

// Read the signed-in user's notification inbox and mark an item read.
export async function loadInbox(client: JsBaoClient) {
  // #region example
  const { items, unreadCount } = await client.notifications.list({ limit: 20 });

  for (const notification of items) {
    console.log(notification.title, notification.read);
  }

  if (items[0] && !items[0].read) {
    await client.notifications.markRead(items[0].notificationId);
  }
  // #endregion example
  return { items, unreadCount };
}
