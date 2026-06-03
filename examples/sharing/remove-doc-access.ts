import type { JsBaoClient } from "js-bao-wss-client";

// Remove document access by userId (existing member) or by email. The email
// form removes a current member if one matches, OR cancels the pending
// deferred share for that email if no direct grant exists.
export async function removeDocAccess(
  client: JsBaoClient,
  documentId: string,
  userId: string,
) {
  // #region example
  // Existing user — by userId
  await client.documents.removePermission(documentId, userId);

  // By email
  await client.documents.removePermission(documentId, { email: "alice@example.com" });
  // #endregion example
}
