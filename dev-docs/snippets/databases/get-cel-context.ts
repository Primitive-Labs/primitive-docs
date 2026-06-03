import type { JsBaoClient } from "js-bao-wss-client";

// Read a database's CEL context dict (referenced from access rules as
// `database.celContext.<key>`).
export async function getCelContext(client: JsBaoClient, databaseId: string) {
  // #region example
  const { celContext } = await client.databases.getCelContext(databaseId);
  // #endregion example
  return celContext;
}
