import type { JsBaoClient } from "js-bao-wss-client";

// Read a blob's metadata (size, content type, tags, sha256) without
// downloading the bytes.
export async function getMetadata(
  client: JsBaoClient,
  bucketIdOrKey: string,
  blobId: string,
) {
  // #region example
  const meta = await client.blobBuckets.getMetadata(bucketIdOrKey, blobId);
  // #endregion example
  return meta;
}
