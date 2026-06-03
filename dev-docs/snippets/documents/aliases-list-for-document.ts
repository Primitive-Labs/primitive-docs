import type { JsBaoClient } from "js-bao-wss-client";

// List all aliases pointing at a document.
export async function aliasesListForDocument(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  const aliases = await client.documents.aliases.listForDocument(documentId);
  // #endregion example
  return aliases;
}
