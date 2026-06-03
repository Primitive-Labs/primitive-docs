import type { JsBaoClient } from "js-bao-wss-client";

// Wait until client and server hold identical document state.
export async function waitForInSync(client: JsBaoClient, documentId: string) {
  // #region example
  await client.documents.waitForInSync(documentId);
  // #endregion example
}
