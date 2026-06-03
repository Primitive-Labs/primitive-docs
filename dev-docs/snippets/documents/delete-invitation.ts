import type { JsBaoClient } from "js-bao-wss-client";

// Deprecated: prefer `removePermission({ email })` or
// `client.invitations.delete`. Delete a legacy per-document invitation.
export async function deleteInvitation(
  client: JsBaoClient,
  documentId: string,
  invitationId: string,
) {
  // #region example
  const result = await client.documents.deleteInvitation(
    documentId,
    invitationId,
  );
  // #endregion example
  return result;
}
