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
          continue;
        }
        if (change.op === "save") {
          // save delivers the full row.
          byId.set(change.id, change.data as Record<string, unknown>);
          continue;
        }
        // On a cache miss (the write brought the row into the filter set),
        // the pre-write row in previousData supplies the base.
        const row = {
          ...(byId.get(change.id) ??
            (change.previousData as Record<string, unknown>) ??
            {}),
        };
        for (const [field, input] of Object.entries(
          change.data as Record<string, unknown>
        )) {
          if (change.op === "patch") {
            // patch delivers the patched fields' new values — merge them;
            // assigning change.data would blank the rest.
            row[field] = input;
          } else if (change.op === "increment") {
            // increment delivers the amounts, not the results — add them.
            row[field] = ((row[field] as number | undefined) ?? 0) + (input as number);
          } else {
            // addToSet / removeFromSet deliver the values added or removed —
            // union or subtract against the current set.
            const current = (row[field] as string[] | undefined) ?? [];
            row[field] =
              change.op === "addToSet"
                ? [...current, ...(input as string[]).filter((v) => !current.includes(v))]
                : current.filter((v) => !(input as string[]).includes(v));
          }
        }
        byId.set(change.id, row);
      }
      render(Array.from(byId.values()));
    },
  });

  // 3. Return teardown — call this on unmount.
  return unsub;
  // #endregion example
}
