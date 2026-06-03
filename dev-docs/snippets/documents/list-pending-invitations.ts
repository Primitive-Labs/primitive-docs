import type { JsBaoClient } from "js-bao-wss-client";

// List pending (deferred) email invitations scoped to a document.
export async function listPendingInvitations(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  const pending = await client.documents.listPendingInvitations(documentId);
  // #endregion example
  return pending; // each: { email, permission, invitationId, createdAt, expiresAt }
}
