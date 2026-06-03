import type { JsBaoClient } from "js-bao-wss-client";

// Deprecated: prefer `client.invitations.get` or `listPendingInvitations`.
// Look up a legacy per-document invitation by email.
export async function getInvitation(client: JsBaoClient, documentId: string) {
  // #region example
  const invitation = await client.documents.getInvitation(
    documentId,
    "teammate@example.com",
  );
  // #endregion example
  return invitation;
}
