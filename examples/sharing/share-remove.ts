import type { JsBaoClient } from "js-bao-wss-client";

// Remove access by user ID, or cancel a member/pending grant by email.
export async function removeShare(
  client: JsBaoClient,
  documentId: string,
  userId: string,
) {
  // #region example
  await client.documents.removePermission(documentId, userId);
  await client.documents.removePermission(documentId, { email: "alice@example.com" });
  // #endregion example
}
