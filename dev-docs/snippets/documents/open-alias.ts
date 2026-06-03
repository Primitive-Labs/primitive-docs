import type { JsBaoClient } from "js-bao-wss-client";

// Resolve an alias and open the document it points at in one call.
export async function openAlias(client: JsBaoClient) {
  // #region example
  const { doc, metadata } = await client.documents.openAlias({
    scope: "user",
    aliasKey: "notes",
  });
  // #endregion example
  return { doc, metadata };
}
