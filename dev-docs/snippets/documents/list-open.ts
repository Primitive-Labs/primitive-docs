import type { JsBaoClient } from "js-bao-wss-client";

// List the IDs of all currently open documents.
export function listOpen(client: JsBaoClient) {
  // #region example
  const openIds = client.documents.listOpen();
  // #endregion example
  return openIds;
}
