import type { JsBaoClient } from "js-bao-wss-client";

// Transfer document ownership to another user.
export async function transferOwnership(
  client: JsBaoClient,
  documentId: string,
  newOwnerId: string,
) {
  // #region example
  await client.documents.transferOwnership(documentId, newOwnerId);
  // #endregion example
}
