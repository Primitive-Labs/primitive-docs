import type { JsBaoClient } from "js-bao-wss-client";

// Grant document access to an entire group. All members get the permission;
// access updates automatically as membership changes.
export async function shareWithGroup(client: JsBaoClient, documentId: string) {
  // #region example
  await client.documents.grantGroupPermission(documentId, {
    groupType: "team",
    groupId: "engineering-team",
    permission: "read-write",
  });
  // #endregion example
}
