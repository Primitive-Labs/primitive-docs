import type { JsBaoClient } from "js-bao-wss-client";

// Merge new key-value pairs into a database's CEL context dict.
export async function updateCelContext(client: JsBaoClient, databaseId: string) {
  // #region example
  const db = await client.databases.updateCelContext(databaseId, {
    region: "eu-west",
    tier: "premium",
  });
  // #endregion example
  return db;
}
