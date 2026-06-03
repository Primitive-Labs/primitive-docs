import type { JsBaoClient } from "js-bao-wss-client";

export async function list(client: JsBaoClient, documentId: string) {
  // #region example
  const blobs = client.document(documentId).blobs();
  const { items, cursor } = await blobs.list({ limit: 50 });
  // pass `cursor` back in to fetch the next page
  const next = cursor ? await blobs.list({ limit: 50, cursor }) : null;
  // #endregion example
  return { items, cursor, next };
}
