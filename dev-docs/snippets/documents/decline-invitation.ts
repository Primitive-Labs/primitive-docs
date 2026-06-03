import type { JsBaoClient } from "js-bao-wss-client";

// Deprecated: no invitee-side decline verb; pending invitations expire
// automatically. Decline a legacy invitation.
export async function declineInvitation(
  client: JsBaoClient,
  documentId: string,
  invitationId: string,
) {
  // #region example
  const result = await client.documents.declineInvitation(
    documentId,
    invitationId,
  );
  // #endregion example
  return result;
}
