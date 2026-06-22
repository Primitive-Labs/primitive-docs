import type { JsBaoClient } from "js-bao-wss-client";

// Read a document blob into memory, selecting the return format via `{ as }`.
// `read` checks the local cache first; on a miss it fetches from the server and
// writes the response into the cache. `forceRedownload` bypasses the cache.
export async function readDocumentBlobFormats(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  const blobs = client.document(documentId).blobs();
  // #region example
  const text = await blobs.read(blobId, { as: "text" });
  const buf = await blobs.read(blobId, { as: "arrayBuffer" });
  const bytes = await blobs.read(blobId, { as: "uint8array" }); // default

  // Bypass the local cache and re-fetch from the server.
  const fresh = await blobs.read(blobId, { as: "text", forceRedownload: true });
  // #endregion example
  return { text, buf, bytes, fresh };
}
