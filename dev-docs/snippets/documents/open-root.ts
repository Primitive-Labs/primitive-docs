import type { JsBaoClient } from "js-bao-wss-client";

// Open the app's shared root document for editing.
export async function openRoot(client: JsBaoClient) {
  // #region example
  const doc = await client.documents.openRoot();
  // #endregion example
  return doc;
}
