import type { JsBaoClient } from "js-bao-wss-client";

// Close an open document, optionally evicting its local data.
export async function close(client: JsBaoClient, documentId: string) {
  // #region example
  const { evicted } = await client.documents.close(documentId, {
    evictLocal: true,
  });
  // #endregion example
  return evicted;
}
