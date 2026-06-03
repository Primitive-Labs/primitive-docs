import type { JsBaoClient } from "js-bao-wss-client";

// Confirm the server has received this client's writes before an irreversible
// action (logout, clearing local storage). Both checks return false if
// disconnected or timed out.
export async function verifySync(client: JsBaoClient, documentId: string) {
  // #region example
  // Point-in-time checks
  const hasAllWrites = await client.documents.includesWrites(documentId);
  const fullyInSync = await client.documents.inSync(documentId);

  // Polling helpers: wait until confirmed
  await client.documents.waitForWriteConfirmation(documentId);
  await client.documents.waitForInSync(documentId);
  // #endregion example
  return { hasAllWrites, fullyInSync };
}
