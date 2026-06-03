import type { JsBaoClient } from "js-bao-wss-client";

// List pending access requests for a document (owner/admin only).
export async function listAccessRequests(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  const requests = await client.documents.listAccessRequests(documentId);
  // #endregion example
  return requests;
}
