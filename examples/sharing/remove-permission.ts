import type { JsBaoClient } from "js-bao-wss-client";

// Removal is its own call — there is no `permission: null` form on
// updatePermissions. Ownership transfer hands the document to a new owner.
export async function removePermissions(
  client: JsBaoClient,
  documentId: string,
  newOwnerId: string
) {
  // #region example
  // Remove a current member by userId:
  await client.documents.removePermission(documentId, "user-abc");

  // Cancel a pending email-based invite, OR remove a current member
  // matched by email:
  await client.documents.removePermission(documentId, {
    email: "alice@example.com",
  });

  // Hand the document to a new owner:
  await client.documents.transferOwnership(documentId, newOwnerId);
  // #endregion example
}
