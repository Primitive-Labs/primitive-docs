import type { JsBaoClient } from "js-bao-wss-client";

// List documents the current user owns. The JS reader takes the full
// `documents.list` option set (offline-first, cache-aware).
export async function ownedDocuments(client: JsBaoClient) {
  // #region example
  const docs = await client.me.ownedDocuments({
    limit: 50,
    tag: "project",
    includeRoot: false,
    localOnly: false,
  });
  // #endregion example
  return docs;
}
