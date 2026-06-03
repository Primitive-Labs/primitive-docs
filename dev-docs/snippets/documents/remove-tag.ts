import type { JsBaoClient } from "js-bao-wss-client";

// Remove a tag from a document. Returns the updated tag list.
export async function removeTag(client: JsBaoClient, documentId: string) {
  // #region example
  const tags = await client.documents.removeTag(documentId, "archived");
  // #endregion example
  return tags;
}
