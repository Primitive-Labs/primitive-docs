import type { JsBaoClient } from "js-bao-wss-client";

// Run a single pipeline operation that bundles several reads from the SAME
// database into one round trip. The pipeline is defined server-side (TOML);
// the client just executes it and reads each step's `data` off `steps`.
export async function loadBundle(client: JsBaoClient, databaseId: string) {
  // #region example
  const bundle = await client.databases.executeOperation(databaseId, "dashboardBundle");
  const groups = bundle.steps?.groups?.data ?? [];
  const accounts = bundle.steps?.accounts?.data ?? [];
  const holdings = bundle.steps?.holdings?.data ?? [];
  // #endregion example
  return { groups, accounts, holdings };
}
