import type { JsBaoClient } from "js-bao-wss-client";

// List the users who have permissions on a document.
export async function getPermissions(client: JsBaoClient, documentId: string) {
  // #region example
  const members = await client.documents.getPermissions(documentId);
  // #endregion example
  return members; // each: { userId, email, name, permission, grantedAt }
}
