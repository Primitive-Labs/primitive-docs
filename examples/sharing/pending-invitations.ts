import type { JsBaoClient } from "js-bao-wss-client";

// Per-resource pending invitations — for "this specific document" or "this
// specific group" panels.
export async function pendingInvitations(
  client: JsBaoClient,
  documentId: string,
  groupType: string,
  groupId: string,
) {
  // #region example
  const docPending = await client.documents.listPendingInvitations(documentId);
  // [{ email, permission, invitationId, createdAt, expiresAt, grantedBy? }]

  const groupPending = await client.groups.listPendingInvitations(groupType, groupId);
  // [{ email, role, invitationId, createdAt, expiresAt, addedBy? }]
  // #endregion example
  return { docPending, groupPending };
}
