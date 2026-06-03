import type { JsBaoClient } from "js-bao-wss-client";

// Fetch metadata for the app's shared root document.
export async function getRoot(client: JsBaoClient) {
  // #region example
  const info = await client.documents.getRoot();
  // #endregion example
  return info;
}
