import type { JsBaoClient } from "js-bao-wss-client";

// Deny a pending access request (owner/admin only).
export async function denyAccessRequest(
  client: JsBaoClient,
  documentId: string,
  requestId: string,
) {
  // #region example
  const result = await client.documents.denyAccessRequest(documentId, requestId);
  // #endregion example
  return result;
}
