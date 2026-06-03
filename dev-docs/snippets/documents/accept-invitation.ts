import type { JsBaoClient } from "js-bao-wss-client";

// Deprecated: per-document accept was removed; shares to existing users take
// effect immediately. Accept a legacy invitation.
export async function acceptInvitation(client: JsBaoClient, documentId: string) {
  // #region example
  const result = await client.documents.acceptInvitation(documentId);
  // #endregion example
  return result;
}
