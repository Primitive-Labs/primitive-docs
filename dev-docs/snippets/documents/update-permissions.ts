import type { JsBaoClient } from "js-bao-wss-client";

// Grant or change a user's permission. By email it routes through the
// deferred-grant flow, so it doubles as "invite to this doc".
export async function updatePermissions(client: JsBaoClient, documentId: string) {
  // #region example
  const result = await client.documents.updatePermissions(documentId, {
    email: "teammate@example.com",
    permission: "read-write",
    sendEmail: true,
  });
  // #endregion example
  return result;
}
