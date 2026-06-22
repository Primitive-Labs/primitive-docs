import type { JsBaoClient } from "js-bao-wss-client";

// Real-time database reads: subscriptions deliver deltas only, so pair the
// `subscribe` call with one operation call for the initial state. Keep the
// operation's filter and the subscription's filter semantically equivalent.
export async function liveOpenTickets(
  client: JsBaoClient,
  dbId: string,
  applyChanges: (changes: unknown[]) => void,
) {
  // #region example
  const initial = await client.databases.executeOperation(dbId, "listMyTickets", {});
  const unsub = client.databases.subscribe(dbId, "my-open-tickets", {
    onChange: (event) => {
      if (event.isOrigin) return; // this tab wrote it
      applyChanges(event.changes);
    },
  });
  // #endregion example
  return { initial, unsub };
}
