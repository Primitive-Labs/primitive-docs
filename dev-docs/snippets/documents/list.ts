import type { JsBaoClient } from "js-bao-wss-client";

// List documents accessible to the current user. Deprecated in favor of
// `client.me.ownedDocuments()` / `client.me.sharedDocuments()`.
export async function list(client: JsBaoClient) {
  // #region example
  const docs = await client.documents.list({ tag: "planning", limit: 50 });
  // #endregion example
  return docs;
}
