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
  const byId = new Map<string, unknown>(tickets.map((t: { id: string }) => [t.id, t]));
  render(Array.from(byId.values()));

  // 2. Subscribe for delta updates.
  const unsub = client.databases.subscribe(databaseId, "my-open-tickets", {
    onChange: (event) => {
      for (const change of event.changes) {
        if (change.op === "delete") byId.delete(change.id);
        else byId.set(change.id, change.data); // save / patch / increment / addToSet / removeFromSet
      }
      render(Array.from(byId.values()));
    },
  });

  // 3. Return teardown — call this on unmount.
  return unsub;
  // #endregion example
}
