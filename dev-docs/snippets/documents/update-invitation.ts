import type { JsBaoClient } from "js-bao-wss-client";

// Deprecated: prefer `updatePermissions` (idempotent). Change a legacy
// invitation's permission level.
export async function updateInvitation(client: JsBaoClient, documentId: string) {
  // #region example
  const result = await client.documents.updateInvitation(
    documentId,
    "teammate@example.com",
    "reader",
  );
  // #endregion example
  return result;
}
