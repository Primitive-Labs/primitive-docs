import type { JsBaoClient } from "js-bao-wss-client";

// Check the current user's access to a document.
export async function validateAccess(client: JsBaoClient, documentId: string) {
  // #region example
  const access = await client.documents.validateAccess(documentId);
  // #endregion example
  return access; // access.hasAccess, access.permission
}
