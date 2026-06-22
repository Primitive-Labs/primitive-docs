import type { JsBaoClient } from "js-bao-wss-client";

// Share a document with an entire group, then list and revoke the group's
// permission. Member changes inside the group propagate automatically — no
// per-membership permission calls.
export async function manageGroupPermission(client: JsBaoClient, documentId: string) {
  // #region example
  await client.documents.grantGroupPermission(documentId, {
    groupType: "team",
    groupId: "engineering",
    permission: "read-write", // owner | read-write | reader
  });

  // Listing / revoking
  await client.documents.listGroupPermissions(documentId);
  await client.documents.revokeGroupPermission(documentId, "team", "engineering");
  // #endregion example
}
