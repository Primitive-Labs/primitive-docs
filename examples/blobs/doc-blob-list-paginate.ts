import type { JsBaoClient } from "js-bao-wss-client";

// Page through a document's blobs by following the opaque `cursor`. The cursor
// is only present when more results exist.
export async function paginateDocumentBlobs(
  client: JsBaoClient,
  documentId: string,
) {
  const blobs = client.document(documentId).blobs();
  // #region example
  const page1 = await blobs.list({ limit: 50 });
  for (const b of page1.items) {
    console.log(b.blobId, b.filename, b.contentType, b.numBytes, b.sha256, b.createdAt);
  }

  // `cursor` is an opaque token; only present when more results remain.
  if (page1.cursor) {
    const page2 = await blobs.list({ cursor: page1.cursor });
    return page2.items;
  }
  // #endregion example
  return page1.items;
}
