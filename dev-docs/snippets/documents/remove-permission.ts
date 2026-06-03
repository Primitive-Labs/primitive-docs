import type { JsBaoClient } from "js-bao-wss-client";

// Revoke a user's access, or cancel a pending email invitation. Accepts a
// userId string, `{ userId }`, or `{ email }`.
export async function removePermission(client: JsBaoClient, documentId: string) {
  // #region example
  await client.documents.removePermission(documentId, {
    email: "teammate@example.com",
  });
  // #endregion example
}
