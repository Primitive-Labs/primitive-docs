import type { JsBaoClient } from "js-bao-wss-client";

// Create a document and assign an alias atomically; fails if the alias exists.
export async function createWithAlias(client: JsBaoClient) {
  // #region example
  const result = await client.documents.createWithAlias({
    title: "User Notes",
    alias: { scope: "user", aliasKey: "notes" },
  });
  // #endregion example
  return result;
}
