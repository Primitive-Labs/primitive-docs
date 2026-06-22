import type { JsBaoClient } from "js-bao-wss-client";

// Remove a member or cancel a pending invite, and hand a document to a new
// owner. There is no `permission: null` to remove — removal is its own call.
export async function managePermissions(
  client: JsBaoClient,
  documentId: string,
  newOwnerId: string,
) {
  // #region example
  // Remove a current member by userId:
  await client.documents.removePermission(documentId, "user-abc");
  await client.documents.removePermission(documentId, { userId: "user-abc" });

  // Cancel a pending email-based invite, OR remove a current member matched by email:
  await client.documents.removePermission(documentId, { email: "alice@example.com" });

  await client.documents.transferOwnership(documentId, newOwnerId);
  // #endregion example
}
