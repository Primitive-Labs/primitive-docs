import type { JsBaoClient } from "js-bao-wss-client";

// Create or update a document alias.
export async function aliasesSet(client: JsBaoClient, documentId: string) {
  // #region example
  const alias = await client.documents.aliases.set({
    scope: "user",
    aliasKey: "notes",
    documentId,
  });
  // #endregion example
  return alias;
}
