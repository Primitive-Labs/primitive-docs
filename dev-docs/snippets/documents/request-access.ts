import type { JsBaoClient } from "js-bao-wss-client";

// Request access to a document you don't currently have permission on.
export async function requestAccess(client: JsBaoClient, documentId: string) {
  // #region example
  const result = await client.documents.requestAccess(documentId, {
    permission: "read-write",
    message: "Need this for the launch review",
  });
  // #endregion example
  return result;
}
