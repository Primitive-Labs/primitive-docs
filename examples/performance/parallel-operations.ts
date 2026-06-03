import type { JsBaoClient } from "js-bao-wss-client";

// Parallelize independent operations: one round trip's worth of wall-clock
// latency instead of N sequential ones. Only use this when no call depends on
// another call's result.
export async function loadDashboard(client: JsBaoClient, databaseId: string) {
  // #region example
  const [groups, accounts, holdings] = await Promise.all([
    client.databases.executeOperation(databaseId, "listGroups"),
    client.databases.executeOperation(databaseId, "listAccounts"),
    client.databases.executeOperation(databaseId, "listHoldings"),
  ]);
  // #endregion example
  return { groups, accounts, holdings };
}
