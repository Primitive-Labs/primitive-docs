import type { JsBaoClient } from "js-bao-wss-client";

// React to server-side database changes in real time. The subscription
// (key, access rule, filter, select) is defined in TOML; the client binds
// to it and receives matching deltas until unsubscribed.
export function watchOpenTickets(
  client: JsBaoClient,
  databaseId: string,
  removeTicket: (id: string) => void,
  replaceTicket: (id: string, row: unknown) => void,
  mergeTicket: (id: string, changedFields: Record<string, unknown>) => void
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
        // change.changeType: "enter" | "update" | "leave"
        // change.op decides the shape of change.data (all subject to `select`):
        //   "save"  → the full row                     "delete" → null
        //   "patch" / "increment" / "addToSet" / "removeFromSet"
        //           → ONLY the changed fields (pre-write row in previousData)
        if (change.op === "delete") removeTicket(change.id);
        else if (change.op === "save") replaceTicket(change.id, change.data);
        // Merge — assigning change.data would blank every untouched field.
        else mergeTicket(change.id, change.data as Record<string, unknown>);
      }
    },
  });

  // Return the teardown handle — call it on unmount to stop receiving deltas.
  return unsub;
  // #endregion example
}
