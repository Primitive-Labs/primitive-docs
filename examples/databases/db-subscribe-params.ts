import type { JsBaoClient } from "js-bao-wss-client";

// Bind values to a parameterized subscription — the bound `params.*` are
// visible to the subscription's `access` and `filter` CEL.
export function watchTeamTickets(
  client: JsBaoClient,
  databaseId: string,
  handleChange: (change: unknown) => void
) {
  // #region example
  const unsub = client.databases.subscribe(databaseId, "tickets-by-team", {
    params: { teamId: "eng" },
    onChange: (event) => {
      for (const change of event.changes) handleChange(change);
    },
  });
  // #endregion example
  return unsub;
}
