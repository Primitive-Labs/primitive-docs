import type { JsBaoClient } from "js-bao-wss-client";

// Revoke a group's permission on a document.
export async function revokeGroupPermission(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  const { success } = await client.documents.revokeGroupPermission(
    documentId,
    "team",
    "eng",
  );
  // #endregion example
  return success;
}
