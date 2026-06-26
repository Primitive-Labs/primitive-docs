import type { JsBaoClient } from "js-bao-wss-client";

// React to server-side database changes in real time. The subscription
// (key, access rule, filter, select) is defined in TOML; the client binds
// to it and receives matching deltas until unsubscribed.
export function watchOpenTickets(
  client: JsBaoClient,
  databaseId: string,
  removeTicket: (id: string) => void,
  upsertTicket: (data: unknown) => void
): () => void {
  // #region example
  const unsub = client.databases.subscribe(databaseId, "my-open-tickets", {
    onChange: (event) => {
      // event.originConnectionId, event.originUserId, event.isOrigin, event.isOriginUser
      if (event.isOrigin) {
        // This same tab wrote it — the UI is already updated optimistically.
        return;
      }
      for (const change of event.changes) {
        // change.op:         "save" | "patch" | "delete" | "increment" | ...
        // change.changeType: "enter" | "update" | "leave"
        // change.data, change.previousData (subject to the select projection)
        if (change.op === "delete") removeTicket(change.id);
        else upsertTicket(change.data);
      }
    },
  });

  // Return the teardown handle — call it on unmount to stop receiving deltas.
  return unsub;
  // #endregion example
}
