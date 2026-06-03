import type { JsBaoClient } from "js-bao-wss-client";

// Add a tag to a document. Returns the updated tag list.
export async function addTag(client: JsBaoClient, documentId: string) {
  // #region example
  const tags = await client.documents.addTag(documentId, "archived");
  // #endregion example
  return tags;
}
