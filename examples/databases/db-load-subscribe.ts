import type { JsBaoClient } from "js-bao-wss-client";

// Canonical real-time pattern: load the full current state once with a regular
// operation, then subscribe for deltas. Keep the operation's filter and the
// subscription's filter semantically equivalent so the UI doesn't flicker.
// Returns the unsub teardown — call it on unmount.
export async function liveTickets(
  client: JsBaoClient,
  databaseId: string,
  render: (rows: unknown[]) => void,
) {
  // #region example
  // 1. Initial load — full current state.
  const { data: tickets } = await client.databases.executeOperation(
    databaseId,
    "list-my-open-tickets",
  );
  const byId = new Map<string, Record<string, unknown>>(
    tickets.map((t: { id: string }) => [t.id, t]),
  );
  render(Array.from(byId.values()));

  // 2. Subscribe for delta updates.
  const unsub = client.databases.subscribe(databaseId, "my-open-tickets", {
    onChange: (event) => {
      for (const change of event.changes) {
        if (change.op === "delete") {
          byId.delete(change.id);
        } else if (change.op === "save") {
          // save delivers the full row.
          byId.set(change.id, change.data as Record<string, unknown>);
        } else {
          // patch / increment / addToSet / removeFromSet deliver ONLY the
          // changed fields — merge them; assigning would blank the rest.
          // On a cache miss (a patch brought the row into the filter set),
          // the pre-write row in previousData supplies the base.
          byId.set(change.id, {
            ...(byId.get(change.id) ??
              (change.previousData as Record<string, unknown>) ??
              {}),
            ...(change.data as Record<string, unknown>),
          });
        }
      }
      render(Array.from(byId.values()));
    },
  });

  // 3. Return teardown — call this on unmount.
  return unsub;
  // #endregion example
}
