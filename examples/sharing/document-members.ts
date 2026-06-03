import type { JsBaoClient } from "js-bao-wss-client";

// List a document's current members and its pending email invites.
export async function listDocumentMembers(client: JsBaoClient, documentId: string) {
  // #region example
  // Current members (accepted permission grants)
  const members = await client.documents.getPermissions(documentId);

  // Pending email invites on this document
  const pending = await client.documents.listPendingInvitations(documentId);
  // #endregion example
  return { members, pending };
}
