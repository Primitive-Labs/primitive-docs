import type { JsBaoClient } from "js-bao-wss-client";

// Approve a pending access request (owner/admin only).
export async function approveAccessRequest(
  client: JsBaoClient,
  documentId: string,
  requestId: string,
) {
  // #region example
  const result = await client.documents.approveAccessRequest(
    documentId,
    requestId,
    { permission: "reader" },
  );
  // #endregion example
  return result;
}
