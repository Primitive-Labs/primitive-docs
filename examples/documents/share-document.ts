import type { JsBaoClient } from "js-bao-wss-client";

// Share a document by user id, by email, or with an entire group.
export async function shareDocument(client: JsBaoClient, documentId: string) {
  // #region example
  // By user ID
  await client.documents.updatePermissions(documentId, {
    userId: "user-abc",
    permission: "read-write",
  });

  // By email — works whether or not the recipient is a member yet
  await client.documents.updatePermissions(documentId, {
    email: "colleague@example.com",
    permission: "read-write",
  });

  // With a group
  await client.documents.grantGroupPermission(documentId, {
    groupType: "team",
    groupId: "engineering",
    permission: "read-write",
  });
  // #endregion example
}
