import type { JsBaoClient } from "js-bao-wss-client";

// Download a blob's raw bytes as an ArrayBuffer.
export async function download(
  client: JsBaoClient,
  bucketIdOrKey: string,
  blobId: string,
) {
  // #region example
  const bytes = await client.blobBuckets.download(bucketIdOrKey, blobId);
  // #endregion example
  return bytes;
}
