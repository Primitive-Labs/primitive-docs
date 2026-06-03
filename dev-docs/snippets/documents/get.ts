import type { JsBaoClient } from "js-bao-wss-client";

// Fetch a document's metadata from the server.
export async function get(client: JsBaoClient, documentId: string) {
  // #region example
  const info = await client.documents.get(documentId);
  // #endregion example
  return info; // info.title, info.lastModified, info.permission, …
}
