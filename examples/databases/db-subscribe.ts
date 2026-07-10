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
        //   "patch" → the patched fields' new values
        //   "increment" / "addToSet" / "removeFromSet" → the op input
        //     (amounts / values added or removed), NOT the resulting values —
        //     derive those from previousData (the pre-write row).
        if (change.op === "delete") {
          removeTicket(change.id);
        } else if (change.op === "save") {
          replaceTicket(change.id, change.data);
        } else if (change.op === "patch") {
          // Merge — assigning change.data would blank every untouched field.
          mergeTicket(change.id, change.data as Record<string, unknown>);
        } else {
          // increment / addToSet / removeFromSet: compute each field's new value.
          const prev = (change.previousData ?? {}) as Record<string, unknown>;
          const resolved: Record<string, unknown> = {};
          for (const [field, input] of Object.entries(
            change.data as Record<string, unknown>
          )) {
            if (change.op === "increment") {
              resolved[field] =
                ((prev[field] as number | undefined) ?? 0) + (input as number);
            } else {
              const current = (prev[field] as string[] | undefined) ?? [];
              resolved[field] =
                change.op === "addToSet"
                  ? [...current, ...(input as string[]).filter((v) => !current.includes(v))]
                  : current.filter((v) => !(input as string[]).includes(v));
            }
          }
          mergeTicket(change.id, resolved);
        }
      }
    },
  });

  // Return the teardown handle — call it on unmount to stop receiving deltas.
  return unsub;
  // #endregion example
}
