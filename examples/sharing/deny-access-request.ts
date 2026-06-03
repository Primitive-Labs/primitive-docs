import type { JsBaoClient } from "js-bao-wss-client";

// Deny a pending document access request. Owner/admin only. The optional
// `documentUrl` is included in the requester's notification email.
export async function denyAccessRequest(
  client: JsBaoClient,
  documentId: string,
  requestId: string,
) {
  // #region example
  await client.documents.denyAccessRequest(documentId, requestId, {
    documentUrl: "https://myapp.example/docs/" + documentId,
  });
  // #endregion example
}
