import type { JsBaoClient } from "js-bao-wss-client";

// Deprecated: prefer `updatePermissions({ email, permission })`.
// Create a legacy per-document invitation by email.
export async function createInvitation(client: JsBaoClient, documentId: string) {
  // #region example
  const result = await client.documents.createInvitation(
    documentId,
    "teammate@example.com",
    "read-write",
    { sendEmail: true },
  );
  // #endregion example
  return result;
}
