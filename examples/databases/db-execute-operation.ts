import type { JsBaoClient } from "js-bao-wss-client";

// Run a registered database operation. All end-user data access goes through
// operations (the operation's CEL `access` is the authorization point).
export async function runOperation(client: JsBaoClient, databaseId: string) {
  // #region example
  const result = await client.databases.executeOperation(databaseId, "list-products", {
    params: { search: "widget" },
  });
  // result: { data: [...records], hasMore: boolean, nextCursor?: string }
  // #endregion example
  return result;
}
