import type { JsBaoClient } from "js-bao-wss-client";

// List pending document invitations for the current user.
export async function pendingDocumentInvitations(client: JsBaoClient) {
  // #region example
  const invitations = await client.me.pendingDocumentInvitations();
  for (const invite of invitations) {
    console.log(invite.invitationId, invite.documentId, invite.permission);
  }
  // #endregion example
  return invitations;
}
