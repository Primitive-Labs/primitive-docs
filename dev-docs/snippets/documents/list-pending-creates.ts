import type { JsBaoClient } from "js-bao-wss-client";

// List documents created locally but not yet committed to the server.
export async function listPendingCreates(client: JsBaoClient) {
  // #region example
  const pending = await client.documents.listPendingCreates();
  // #endregion example
  return pending; // each: { documentId, title?, createdAt }
}
