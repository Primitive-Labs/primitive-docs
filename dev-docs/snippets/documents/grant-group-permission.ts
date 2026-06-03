import type { JsBaoClient } from "js-bao-wss-client";

// Grant a group a permission level on a document.
export async function grantGroupPermission(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  const entry = await client.documents.grantGroupPermission(documentId, {
    groupType: "team",
    groupId: "eng",
    permission: "read-write",
  });
  // #endregion example
  return entry;
}
