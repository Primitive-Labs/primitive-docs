import type { JsBaoClient } from "js-bao-wss-client";

// Subscribe to real-time database changes for a server-registered subscription.
// JS-only — the Swift client has no equivalent.
export function subscribe(
  client: JsBaoClient,
  databaseId: string,
  subscriptionKey: string,
  currentUserId: string,
) {
  // #region example
  const unsub = client.databases.subscribe(databaseId, subscriptionKey, {
    params: { userId: currentUserId },
    onChange: (event) => {
      for (const change of event.changes) {
        console.log(change.op, change.id, change.data);
      }
    },
  });
  // Later: unsub();
  // #endregion example
  return unsub;
}
