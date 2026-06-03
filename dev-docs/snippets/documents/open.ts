import type { JsBaoClient } from "js-bao-wss-client";

// Open a document for editing. Returns the Yjs doc and its local metadata.
export async function open(client: JsBaoClient, documentId: string) {
  // #region example
  const { doc, metadata } = await client.documents.open(documentId, {
    waitForLoad: "localIfAvailableElseNetwork",
  });
  // #endregion example
  return { doc, metadata };
}
