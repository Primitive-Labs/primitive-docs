import type { JsBaoClient } from "js-bao-wss-client";

// Wait until the server confirms it has all of this client's writes.
export async function waitForWriteConfirmation(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  const confirmed = await client.documents.waitForWriteConfirmation(documentId);
  // #endregion example
  return confirmed;
}
