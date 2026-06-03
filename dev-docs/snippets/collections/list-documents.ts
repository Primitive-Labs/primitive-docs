import type { JsBaoClient } from "js-bao-wss-client";

// List documents in a collection, with each caller's effective permission.
export async function listDocuments(
  client: JsBaoClient,
  collectionId: string,
) {
  // #region example
  const page = await client.collections.listDocuments(collectionId, {
    limit: 50,
  });
  for (const doc of page.items) {
    console.log(doc.title, doc.permission);
  }
  // #endregion example
  return page.cursor;
}
