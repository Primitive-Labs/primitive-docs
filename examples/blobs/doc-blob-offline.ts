import type { JsBaoClient } from "js-bao-wss-client";

// Work with document blobs offline: queue an upload while offline, read cached
// bytes, warm the cache with prefetch, and resume the queue when back online.
export async function workOffline(
  client: JsBaoClient,
  documentId: string,
  data: Uint8Array,
  blobIds: string[],
) {
  const blobs = client.document(documentId).blobs();
  // #region example
  await client.setNetworkMode("offline");

  // Bytes are written to the local cache immediately and queued. upload()
  // resolves without waiting for the network (bytesTransferred is 0).
  const { blobId } = await blobs.upload(data, {
    filename: "draft.txt",
    contentType: "text/plain",
  });

  // Reads served from cache for blobs uploaded or downloaded on this device.
  const text = await blobs.read(blobId, { as: "text" });

  // Warm the cache; per-blob errors are logged and swallowed.
  await blobs.prefetch(blobIds, { concurrency: 4 });

  // Queued uploads resume automatically once back online.
  await client.setNetworkMode("online");
  // #endregion example
  return text;
}
