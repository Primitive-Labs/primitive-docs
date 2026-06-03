import type { JsBaoClient } from "js-bao-wss-client";

// Deprecated: prefer `listPendingInvitations`. Lists legacy per-document
// invitations.
export async function listInvitations(client: JsBaoClient, documentId: string) {
  // #region example
  const invitations = await client.documents.listInvitations(documentId);
  // #endregion example
  return invitations;
}
